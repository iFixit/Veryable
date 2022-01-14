import prisma from '../prisma/client'

import Pull from '../db/db_pull'
import PullHistoryRecorder from '../db/db_pull_history'
import { isCommitQAReady, parseCommit } from '../controllers/commit_controller'
import { parseComment } from './comment_controller'

import {PullRequestTimelineItems} from "@octokit/graphql-schema"
import logger from '../src/logger'
const log = logger('pull_parser_timeline')

import { utils } from '../scripts/utils'


// For every Pull, we need to parse all the timeline events
export async function parseTimeline(pull: Pull, timelineItems: PullRequestTimelineItems[]) {
  // For every Pull we want to keep track of the events
  const recorder = new PullHistoryRecorder(pull.getID())

  // Set the Dev Block state for the Pull to reference for later commits
  const pull_dev_block_state = false;

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
        break;
      }
      case "PullRequestReview":{
        break;
      }
    }
  })
}