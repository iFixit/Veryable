import prisma from '../prisma/client'

import Pull from '../db/db_pull'
import PullHistoryRecorder from '../db/db_pull_history'
import { parseCommit } from '../controllers/commit_controller'

import {PullRequestTimelineItems} from "@octokit/graphql-schema"
import logger from '../src/logger'
const log = logger('pull_parser_timeline')

// For every Pull, we need to parse all the timeline events
export async function parseTimeline(pull: Pull, timelineItems: PullRequestTimelineItems[]) {
  // For every Pull we want to keep track of the events
  const recorder = new PullHistoryRecorder(pull.getID())

  timelineItems.forEach(event => {
    switch (event.__typename) {
      case "PullRequestCommit": {
        const commit = parseCommit(pull, event)
        pull.appendCommit(commit)
        break;
      }
      case "IssueComment": {
        break;
      }
      case "PullRequestReview":{
        break;
      }
    }
  })
}