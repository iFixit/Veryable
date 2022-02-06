import prisma from '../prisma/client'

import Pull from '../db/db_pull'
import PullHistoryRecorder from '../db/db_pull_history'
import { isCommitQAReady, parseCommit } from '../controllers/commit_controller'
import { parseComment } from './comment_controller'

import {IssueComment, PullRequestReview, PullRequestReviewComment, PullRequestTimelineItems} from "@octokit/graphql-schema"
import logger from '../src/logger'
const log = logger('pull_parser_timeline')

import { utils } from '../scripts/utils'
import CommitDB from '../db/db_commit'
import { PullRequestHistory } from '@prisma/client'
import { backFillCommits } from './backfill_controller'

// For every Pull, we need to parse all the timeline events
export async function parseTimeline(pull: Pull, timelineItems: PullRequestTimelineItems[]) {
  // For every Pull we want to keep track of the events
  const recorder = new PullHistoryRecorder(pull.getID())

  // Set the Dev Block state for the Pull to reference for later commits
  let pull_dev_block_state = false;

  // Set the Interacted state for the Pull to reference for later interactions
  let pull_interacted_state = false

  timelineItems.forEach(event => {
    switch (event.__typename) {
      case "PullRequestCommit": {
        const commit = parseCommit(pull, event)
        pull.appendCommit(commit)
        recorder.setCurrentCommitRef(commit)

        // Can check the CI status and Pull Dev Block state for a commit without need to review the comments
        // Need to Check if the Commit is QA Ready
        if (isCommitQAReady(pull_dev_block_state, commit.commit,pull.isQARequired())) {
          // Log Event
          recorder.logEvent(commit.getPushedDate(),'qa_ready','CI')
        }

        // Reset Interacted State
        pull_interacted_state = false
        break;
      }
      case "IssueComment": {
        const signatures = parseComment(event, pull.getAuthor())

        // It is possible to have a comment before commit events if there is a force-push
        if (pull.getNumberOfCommits() === 0) {
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

        if (signatures.qaed) {
          recorder.logEvent(utils.getUnixTimeFromISO(event.createdAt), 'qa_stamped', event.author?.login || "unkown author")
          recorder.logEvent(utils.getUnixTimeFromISO(event.createdAt), 'non_qa_ready', event.author?.login || "unkown author")
        }

        checkAndRecordDevBlockSignature(signatures.dev_block, event, recorder, pull.isQARequired())
        pull_dev_block_state = signatures.dev_block ?? pull_dev_block_state

        checkAndRecordInteraction(signatures.interacted, event, recorder, pull_interacted_state)
        pull_interacted_state = signatures.interacted || pull_interacted_state

        break;
      }
      case "PullRequestReview": {
          if (pull.getNumberOfCommits() === 0) {
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

        // Check if there is a general review comment, if so parse it
        if (event.bodyText) {
          const signatures = parseComment(event, pull.getAuthor())
          if (signatures.qaed) {
            recorder.logEvent(utils.getUnixTimeFromISO(event.createdAt), 'qa_stamped', event.author?.login || "unkown author")
            recorder.logEvent(utils.getUnixTimeFromISO(event.createdAt), 'non_qa_ready', event.author?.login || "unkown author")
          }


          checkAndRecordDevBlockSignature(signatures.dev_block, event, recorder, pull.isQARequired())
          pull_dev_block_state = signatures.dev_block ?? pull_dev_block_state

          checkAndRecordInteraction(signatures.interacted, event, recorder, pull_interacted_state)
          pull_interacted_state = signatures.interacted || pull_interacted_state
        }

        event.comments.nodes?.map(comment => {
          if (!comment) {
            return
          }

          const signatures = parseComment(comment, pull.getAuthor())
          if (signatures.qaed) {
            recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'qa_stamped', comment.author?.login || "unkown author")
            recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'non_qa_ready', comment.author?.login || "unkown author")
          }


          checkAndRecordDevBlockSignature(signatures.dev_block, comment, recorder, pull.isQARequired())
          pull_dev_block_state = signatures.dev_block ?? pull_dev_block_state

          checkAndRecordInteraction(signatures.interacted, comment, recorder, pull_interacted_state)
          pull_interacted_state = signatures.interacted || pull_interacted_state
        })
        break;
      }
    }
  })

  parseRecordsAndBackFill(recorder.getPullRecords(),pull,pull_dev_block_state)
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

function parseRecordsAndBackFill(records: PullRequestHistory[], pull: Pull, last_pull_dev_block_state: boolean) {
  const backfilled_commits = backFillCommits(records, pull)
  const head_commit = backfilled_commits[pull.getHeadCommitSha()]


}