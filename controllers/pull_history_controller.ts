import prisma from '../prisma/client'

import Pull from '../db/db_pull'
import PullHistoryRecorder from '../db/db_pull_history'
import { isCommitQAReady, parseCommit } from '../controllers/commit_controller'
import { isDevBlocked, isInteracted, isQAed } from './comment_controller'

import {IssueComment, PullRequestCommit, PullRequestReview, PullRequestReviewComment, PullRequestTimelineItems} from "@octokit/graphql-schema"
import logger from '../src/logger'
const log = logger('pull_parser_timeline')

import { utils } from '../scripts/utils'
import CommitDB from '../db/db_commit'
import { PullRequestHistory } from '@prisma/client'
import { backFillCommits, backFillPullRequest } from './backfill_controller'

// For every Pull, we need to parse all the timeline events
function parseTimeline(pull: Pull, timelineItems: PullRequestTimelineItems[]) {
  // For every Pull we want to keep track of the events
  const recorder = new PullHistoryRecorder(pull.getID())

  timelineItems.forEach(event => {
    switch (event.__typename) {
      case "PullRequestCommit": {
        handlePullRequestCommitEvent(pull,event,recorder)
        pull.setInteractedState(false)
        pull.setQAStampedState(false)
        break;
      }
      case "IssueComment": {
        handleIssueCommentEvent(pull, event, recorder)
        break;
      }
      case "PullRequestReview": {
        handlePullRequestReviewEvent(pull, event, recorder)
        break;
      }
    }
  })
  const updated_pull = getUpdatedPull(recorder.getPullRecords(), pull)

  return {
    pull_to_save: updated_pull,
    pull_history_to_save: recorder
  }
}

function checkAndRecordQAedSignature(comment: IssueComment | PullRequestReview | PullRequestReviewComment, recorder: PullHistoryRecorder, pull: Pull) {
   const qaed = isQAed(comment)
   if (qaed) {
     recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'qa_stamped', comment.author?.login || "unkown author")

     if (pull.isQAReady()) {
       recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'non_qa_ready', 'QAed')
     }

     pull.setQAReadyState(false)
     pull.setQAStampedState(true)
  }
}

function checkAndRecordDevBlockSignature(comment: IssueComment | PullRequestReview | PullRequestReviewComment, recorder: PullHistoryRecorder, pull: Pull) {
  const dev_blocked = isDevBlocked(comment)
  switch (dev_blocked) {
    case true:
      recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'dev_blocked', comment.
        author?.login || "unkown author")

      if (pull.isQARequired() && pull.isQAReady()) {
        recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'non_qa_ready', 'dev block change')
      }

      pull.setQAReadyState(false)
      pull.setDevBlockedState(true)
      break
    case false:
      recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'un_dev_blocked', comment.author?.login || "unkown author")

      if (!pull.isQAed() && isCommitQAReady(false, recorder.getCurrentCommit(), pull.isQARequired())) {
        recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'qa_ready', 'dev block change')
        pull.setQAReadyState(true)
      }

      pull.setDevBlockedState(false)
      break
  }
}

function checkAndRecordInteraction(comment: IssueComment | PullRequestReview | PullRequestReviewComment, recorder: PullHistoryRecorder, pull: Pull): void {
  const interacted = isInteracted(comment, pull.getAuthor())
  if (!pull.wasInteractedWith() && interacted) {
    recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'first_interaction', comment.author?.login || 'qa team')
    pull.setInteractedState(true)
  }
  else if (interacted) {
    recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'interacted', comment.author?.login || 'qa team')
  }
}

function handlePullRequestCommitEvent(pull: Pull, pull_request_commit_event: PullRequestCommit, recorder: PullHistoryRecorder) {
  const commit = parseCommit(pull, pull_request_commit_event)
  pull.appendCommit(commit)
  if (commit.getSha() === pull.getHeadCommitSha()) {
    pull.head_commit = commit
  }
  recorder.setCurrentCommitRef(commit)

  // Can check the CI status and Pull Dev Block state for a commit without need to review the comments
  // Need to Check if the Commit is QA Ready
  if (isCommitQAReady(pull.isDevBlocked(), commit.getCommit(),pull.isQARequired())) {
    // Log Event
    recorder.logEvent(commit.getPushedDate(), 'qa_ready', 'CI')
    pull.setQAReadyState(true)
  }
}

function handleIssueCommentEvent(pull: Pull, issue_comment_event: IssueComment, recorder: PullHistoryRecorder) {
   // It is possible to have a comment before commit events if there is a force-push
    if (hasNoCurrentCommitReference(pull)) {
      setGhostCommitForReference(pull, recorder, issue_comment_event)
    }
    return handleCommentEvent(pull, issue_comment_event, recorder)
}

function handlePullRequestReviewEvent(pull: Pull, pull_request_review_event: PullRequestReview, recorder: PullHistoryRecorder) {
  if (hasNoCurrentCommitReference(pull)) {
    setGhostCommitForReference(pull, recorder, pull_request_review_event)
  }

  if (reviewHasBodyText(pull_request_review_event)) {
    handleCommentEvent(pull, pull_request_review_event, recorder)
  }

  const sanitized_review_comments = utils.removeMaybeNulls(pull_request_review_event.comments.nodes)

  sanitized_review_comments?.map(review_comment => {
    handleCommentEvent(pull, review_comment, recorder)
  })
}

function handleCommentEvent(pull: Pull, comment_event: IssueComment | PullRequestReview  | PullRequestReviewComment, recorder: PullHistoryRecorder) {
  checkAndRecordQAedSignature(comment_event, recorder, pull)

  checkAndRecordDevBlockSignature(comment_event, recorder,pull)

  checkAndRecordInteraction(comment_event, recorder, pull)
}

function hasNoCurrentCommitReference(pull: Pull): boolean {
  return pull.getNumberOfCommits() === 0
}

function reviewHasBodyText(review: PullRequestReview): boolean {
  return review.bodyText !== undefined || review.bodyText !== ''
}

function setGhostCommitForReference(pull: Pull, recorder: PullHistoryRecorder, event: IssueComment | PullRequestReview): void {
  const ghost_commit = new CommitDB(
    {
    commit_event_id: event.id, //use comment id as commit id
    sha: 'unknown_starting_commit',
    qa_ready: null,
    interacted: null,
    dev_blocked: null,
    qa_stamped: null,
    ci_status: null,
    committed_at: utils.getUnixTimeFromISO(event.createdAt),
    pushed_at: null,
    pull_request_id: pull.getID()
    }
  )

  pull.appendCommit(ghost_commit)
  recorder.setCurrentCommitRef(ghost_commit)
}

function getUpdatedPull(recorder: PullRequestHistory[], pull: Pull) {
  if (recorder.length) {
    return  parseRecordsAndBackFill(recorder, pull)
  }
  return new Pull(pull.getPullRequest(), pull.getCommits(), pull.getHeadCommit())
}

function parseRecordsAndBackFill(records: PullRequestHistory[], pull: Pull): Pull {
  const backfilled_commits = backFillCommits(records, pull)

  const head_commit = backfilled_commits[pull.getHeadCommit().getID()]

  const backfilled_pull_request = backFillPullRequest(records, pull.getPullRequest(), head_commit, pull.isDevBlocked())

  return new Pull(backfilled_pull_request, Object.values(backfilled_commits), head_commit)
}

export {parseTimeline, checkAndRecordQAedSignature, checkAndRecordDevBlockSignature, checkAndRecordInteraction, getUpdatedPull, parseRecordsAndBackFill, handleCommentEvent, handleIssueCommentEvent, handlePullRequestCommitEvent, handlePullRequestReviewEvent}

export async function getQAReadyEventsSinceDate(n_days: number) {
  return await prisma.pullRequestHistory.groupBy({
    by: ['start_date', 'pull_request_id', 'event', 'date'], where: {
      start_date: {
        gte: n_days
      },
      event: { in: ['qa_ready', 'non_qa_ready'] },
    }
  })
}