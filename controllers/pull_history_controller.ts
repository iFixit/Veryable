import prisma from '../prisma/client'

import Pull from '../db/db_pull'
import PullHistoryRecorder from '../db/db_pull_history'
import { isCommitQAReady, parseCommit } from '../controllers/commit_controller'
import { parseComment } from './comment_controller'

import {IssueComment, PullRequestTimelineItems} from "@octokit/graphql-schema"
import logger from '../src/logger'
const log = logger('pull_parser_timeline')

import { utils } from '../scripts/utils'


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
        if (isCommitQAReady(pull_dev_block_state, commit.commit)) {
          // Log Event
          recorder.logEvent(commit.getPushedDate(),'qa_ready','CI')
        }
        break;
      }
      case "IssueComment": {
        const signatures = parseComment(event, pull.getAuthor())

        if (signatures.qaed) {
          recorder.logEvent(utils.getUnixTimeFromISO(event.createdAt), 'qa_stamped', event.author?.login || "unkown author")

          recorder.logEvent(utils.getUnixTimeFromISO(event.createdAt), 'non_qa_ready', event.author?.login || "unkown author")
        }

        checkAndRecordDevBlockSignature(signatures.dev_block, event, recorder)
        pull_dev_block_state = signatures.dev_block ?? pull_dev_block_state

        checkAndRecordInteraction(signatures.interacted, event, recorder, pull_interacted_state)
        pull_interacted_state = signatures.interacted || pull_interacted_state

        break;
      }
      case "PullRequestReview":{
        break;
      }
    }
  })
}

function checkAndRecordDevBlockSignature(dev_block: boolean | null, comment: IssueComment, recorder: PullHistoryRecorder) {
  switch (dev_block) {
    case true:
      recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'dev_blocked', comment.
        author?.login || "unkown author")
      recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'non_qa_ready', 'dev block change')
      break
    case false:
      recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt), 'un_dev_blocked', comment.author?.login || "unkown author")
      if (isCommitQAReady(false, recorder.getCurrentCommit())) {
        recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt),'qa_ready','dev block change')
      }
      break
  }
}

function checkAndRecordInteraction(interacted: boolean, comment: IssueComment, recorder: PullHistoryRecorder, previous_pull_interacted_state: boolean): void {
  if (!previous_pull_interacted_state && interacted) {
    recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt),'first_interaction',comment.author?.login || 'qa team')
  }
  else if (interacted) {
    recorder.logEvent(utils.getUnixTimeFromISO(comment.createdAt),'interacted',comment.author?.login || 'qa team')
  }
}