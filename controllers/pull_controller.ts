import { PullRequest, pull_request_state } from "@prisma/client"

import Pull from '../db/db_pull'
import config from '../config/config'
const { signatures } = config

import { utils } from '../scripts/utils'

import logger from '../src/logger'
import { PullRequest as GitHubPullRequest } from '@octokit/graphql-schema';
import { parseTimeline } from "./pull_history_controller"
import PullHistoryRecorder from "../db/db_pull_history"

const log = logger('pullParser')

function parsePulls(github_pulls: GitHubPullRequest[] | undefined):{ pull_to_save: Pull, pull_history_to_save: PullHistoryRecorder | null }[] {
  const items_to_save: { pull_to_save: Pull, pull_history_to_save: PullHistoryRecorder | null }[] = []
  github_pulls?.forEach(github_pull => {
    const pull = parsePull(github_pull)
    const sanitized_timeline_items = utils.removeMaybeNulls(github_pull.timelineItems.nodes)
    if (sanitized_timeline_items) {
      items_to_save.push(parseTimeline(pull, sanitized_timeline_items))
    } else {
      items_to_save.push({pull_to_save:pull, pull_history_to_save: null})
    }
  });

  return items_to_save
}


function parsePull(github_pull: GitHubPullRequest): Pull {
  log.data(`Parsing Pull #${github_pull.number} ${github_pull.title}`)
  const pull_request: PullRequest = grabValues(github_pull)
  return new Pull(pull_request)
}

function grabValues(github_pull: GitHubPullRequest): PullRequest {
  log.info('GitHub Pull %o', github_pull)
  return {
      pull_request_id: github_pull.id,
      repo: github_pull.baseRepository?.nameWithOwner ?? 'unknown',
      closes: closesDeclared(github_pull),
      pull_number: github_pull.number,
      state: github_pull.state as pull_request_state,
      title: github_pull.title,
      head_ref: github_pull.headRefOid,
      head_commit_id: github_pull.headRef?.id ?? 'unknown',
      created_at: utils.getUnixTimeFromISO(github_pull.createdAt) || null,
      updated_at: utils.getUnixTimeFromISO(github_pull.updatedAt) || null,
      merged_at: utils.getUnixTimeFromISO(github_pull.mergedAt) || null,
      closed_at: utils.getUnixTimeFromISO(github_pull.closedAt) || null,
      author: github_pull.author?.login ?? 'unknown',
      qa_req: qaRequired(github_pull),
      qa_ready: false,
      interacted: false,
      dev_blocked: false,
      qa_stamped: false,
      agg_qa_ready_count: 0,
      agg_interacted_count: 0,
      agg_dev_block_count: 0,
      agg_qa_stamped_count: 0,
    }
}

// Check if there is an Issue connected with Pull
function closesDeclared(github_pull: GitHubPullRequest): number | null {
  const body = github_pull.bodyText || ''
  const closes_regex = new RegExp(signatures.closes, 'i')
  const __CLOSE = body.match(closes_regex)

  if (__CLOSE?.groups) {
    return parseInt(__CLOSE.groups.closes)
  }
  return null;
}

// Check if the Pull requires QAing
function qaRequired(github_pull: GitHubPullRequest): number {
  const body = github_pull.bodyText || ''
  const qa_regex = new RegExp(signatures.qa_req, 'i')
  const qa = body.match(qa_regex)

  if (!qa) {
    return 1
  }

  if (!qa?.groups) {
    throw new Error("Config invalid: `signatures.qa_req` requires exactly one capture group to grab the number")
  }

  return parseInt(qa.groups.qa_req);
}

export { parsePulls, parsePull, grabValues, closesDeclared, qaRequired}