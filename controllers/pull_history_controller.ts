import prisma from '../prisma/client'

import Pull from '../db/db_pull'
import PullHistoryRecorder from '../db/db_pull_history'
import { isCommitQAReady, parseCommit } from '../controllers/commit_controller'
import { parseComment } from './comment_controller'

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

  // Set the Dev Block state for the Pull to reference for later commits
  let pull_dev_block_state = false;

  // Set the Interacted state for the Pull to reference for later interactions
  let pull_interacted_state = false
  timelineItems.forEach(event => {
    switch (event.__typename) {
      case "PullRequestCommit": {
        handlePullRequestCommitEvent(pull,event,recorder,pull_dev_block_state)

        pull_interacted_state = false
        break;
      }
      case "IssueComment": {
        const { updated_dev_block_state, updated_interacted_state } = handleIssueCommentEvent(pull, event, recorder, pull_dev_block_state, pull_interacted_state)

        pull_dev_block_state = updated_dev_block_state
        pull_interacted_state = updated_interacted_state
        break;
      }
      case "PullRequestReview": {
        const { updated_dev_block_state, updated_interacted_state } = handlePullRequestReviewEvent(pull, event, recorder, pull_dev_block_state, pull_interacted_state)

        pull_dev_block_state = updated_dev_block_state
        pull_interacted_state = updated_interacted_state
        break;
      }
    }
  })
  const updated_pull = getUpdatedPull(recorder.getPullRecords(), pull, pull_dev_block_state)

  return {
    pull_to_save: updated_pull,
    pull_history_to_save: recorder
  }
}

function checkAndRecordQAedSignature(qaed: boolean, comment: IssueComment | PullRequestReview | PullRequestReviewComment, recorder: PullHistoryRecorder) {
   if (qaed) {
    recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'qa_stamped', comment.author?.login || "unkown author")
    recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'non_qa_ready', comment.author?.login || "unkown author")
  }
}

function checkAndRecordDevBlockSignature(dev_block: boolean | null, comment: IssueComment | PullRequestReview | PullRequestReviewComment, recorder: PullHistoryRecorder, pull_qa_req: boolean) {
  switch (dev_block) {
    case true:
      recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'dev_blocked', comment.
        author?.login || "unkown author")
      //If there is no QA required, then there is no point in recording the event of the commit not being QA ready from a dev block
      if (pull_qa_req) {
        recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'non_qa_ready', 'dev block change')
      }
      break
    case false:
      recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'un_dev_blocked', comment.author?.login || "unkown author")
      if (isCommitQAReady(false, recorder.getCurrentCommit(),pull_qa_req)) {
        recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt),'qa_ready','dev block change')
      }
      break
  }
}

function checkAndRecordInteraction(interacted: boolean, comment: IssueComment | PullRequestReview  | PullRequestReviewComment, recorder: PullHistoryRecorder, previous_pull_interacted_state: boolean): void {
  if (!previous_pull_interacted_state && interacted) {
    recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt),'first_interaction',comment.author?.login || 'qa team')
  }
  else if (interacted) {
    recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt),'interacted',comment.author?.login || 'qa team')
  }
}

function handlePullRequestCommitEvent(pull: Pull, pull_request_commit_event: PullRequestCommit, recorder: PullHistoryRecorder, pull_dev_block_state: boolean) {
  log.info('Pull request commit event %o',pull_request_commit_event)
  const commit = parseCommit(pull, pull_request_commit_event)
  pull.appendCommit(commit)
  if (commit.getSha() === pull.getHeadCommitSha()) {
    pull.head_commit = commit
  }
  recorder.setCurrentCommitRef(commit)

  // Can check the CI status and Pull Dev Block state for a commit without need to review the comments
  // Need to Check if the Commit is QA Ready
  if (isCommitQAReady(pull_dev_block_state, commit.getCommit(),pull.isQARequired())) {
    // Log Event
    recorder.logEvent(commit.getPushedDate(),'qa_ready','CI')
  }
}

function handleIssueCommentEvent(pull: Pull, issue_comment_event: IssueComment, recorder: PullHistoryRecorder, pull_dev_block_state: boolean, pull_interacted_state: boolean) {
   // It is possible to have a comment before commit events if there is a force-push
    if (hasNoCurrentCommitReference(pull)) {
      setGhostCommitForReference(pull, recorder, issue_comment_event)
    }
    return handleCommentEvent(pull, issue_comment_event, recorder, pull_dev_block_state, pull_interacted_state)
}

function handlePullRequestReviewEvent(pull: Pull, pull_request_review_event: PullRequestReview, recorder: PullHistoryRecorder, pull_dev_block_state: boolean, pull_interacted_state: boolean) {
  if (hasNoCurrentCommitReference(pull)) {
    setGhostCommitForReference(pull, recorder, pull_request_review_event)
  }

  if (reviewHasBodyText(pull_request_review_event)) {
    const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, pull_request_review_event, recorder, pull_dev_block_state, pull_interacted_state)

    pull_dev_block_state = updated_dev_block_state
    pull_interacted_state = updated_interacted_state
  }

  pull_request_review_event.comments.nodes?.map(review_comment => {
    if (!review_comment) {
      return
    }

    const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, review_comment, recorder, pull_dev_block_state, pull_interacted_state)

    pull_dev_block_state = updated_dev_block_state
    pull_interacted_state = updated_interacted_state
  })

  return { updated_dev_block_state: pull_dev_block_state, updated_interacted_state: pull_interacted_state}
}

function handleCommentEvent(pull: Pull, comment_event: IssueComment | PullRequestReview  | PullRequestReviewComment, recorder: PullHistoryRecorder, pull_dev_block_state: boolean, pull_interacted_state: boolean) {
  const signatures = parseComment(comment_event, pull.getAuthor())

  checkAndRecordQAedSignature(signatures.qaed, comment_event, recorder)

  checkAndRecordDevBlockSignature(signatures.dev_block, comment_event, recorder, pull.isQARequired())

  checkAndRecordInteraction(signatures.interacted, comment_event, recorder, pull_interacted_state)

  return {
    updated_dev_block_state: signatures.dev_block ?? pull_dev_block_state, updated_interacted_state: signatures.interacted || pull_interacted_state
  }
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

function getUpdatedPull(recorder: PullRequestHistory[], pull: Pull, pull_dev_block_state: boolean) {
  if (recorder.length) {
    return  parseRecordsAndBackFill(recorder, pull, pull_dev_block_state)
  }
  return new Pull(pull.getPullRequest(), pull.getCommits(), pull.getHeadCommit())
}


function parseRecordsAndBackFill(records: PullRequestHistory[], pull: Pull, last_pull_dev_block_state: boolean): Pull {
  const backfilled_commits = backFillCommits(records, pull)

  const head_commit = backfilled_commits[pull.getHeadCommit().getID()]

  const backfilled_pull_request = backFillPullRequest(records, pull.getPullRequest(), head_commit, last_pull_dev_block_state)

  return new Pull(backfilled_pull_request, Object.values(backfilled_commits), head_commit)
}

export {parseTimeline, checkAndRecordDevBlockSignature, checkAndRecordInteraction, getUpdatedPull, parseRecordsAndBackFill}

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