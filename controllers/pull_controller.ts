import date from 'date-and-time';
import { Pull, qa_pulls_state } from "@prisma/client"

import PullRequest from '../db/db_pull'
import config from '../config/config'
const { qa_team, signatures } = config

import { utils } from '../scripts/utils'

import logger from '../src/logger'

const log = logger('pullParser')

export async function parsePull(github_pull: GitHubPullRequest, db_pull: Pull | null): Promise<Pull> {
  log.data(`Parsing Pull #${github_pull.number} ${github_pull.title}`)
  const pull: Pull = grabValues(github_pull, db_pull)
  return await PullRequest.save(pull)
}

function grabValues(github_pull: GitHubPullRequest, db_pull: Pull | null): Pull {
  let { qa_ready, qa_req, qa_interacted } = isQAReadyAndInteracted(github_pull)

  let qa_ready_count = 0;
  let interacted_count = 0;

  if (db_pull) {
    qa_ready_count = db_pull.qa_ready_count + (!db_pull.qa_ready && qa_ready ? 1 : 0)

    interacted_count = db_pull.interacted_count + (!db_pull.interacted && qa_interacted ? 1 : 0)
  }
  return {
      closed_at: formatGHDate(github_pull.closedAt),
      closes: closesDeclared(github_pull),
      created_at: formatGHDate(github_pull.createdAt),
      head_ref: github_pull.headRefOid,
      interacted_count: interacted_count,
      interacted: qa_interacted,
      merged_at: formatGHDate(github_pull.mergedAt),
      pull_number: github_pull.number,
      qa_ready_count: qa_ready_count,
      qa_ready: qa_ready,
      qa_req: qa_req,
      repo: github_pull.baseRepository.nameWithOwner,
      state: github_pull.state as qa_pulls_state,
      title: github_pull.title,
      updated_at: formatGHDate(github_pull.updatedAt),
    }
}

function formatGHDate(utc_date: string | null): number | null {
  if (utc_date) {
    return Math.floor(new Date(utc_date).getTime() / 1000);
  }
  return null;
}

// Check if there is an Issue connected with Pull
function closesDeclared(github_pull: GitHubPullRequest): number | null {
  let body = github_pull.bodyText || ''
  let closes_regex = new RegExp(signatures.closes, 'i')
  let closes_pull
  let __CLOSE = body.match(closes_regex)

  if (__CLOSE?.groups) {
    closes_pull = parseInt(__CLOSE.groups.closes)
  }
  return closes_pull ?? null;
}
// Get Signatures/Stamps
function getTagsAndInteracted(github_pull: GitHubPullRequest): { QA: boolean, dev_block: string, interacted: boolean } {
  let latest_commit_date = github_pull.commits
    ? new Date(github_pull.commits.nodes[0].commit.pushedDate) : new Date();
  let current_tags = {
    QA: false,
    dev_block: '',
    interacted: false
  }

  const comments = github_pull.comments ? github_pull.comments.nodes : []
  comments.forEach(comment => {
    let comment_date = new Date(comment.createdAt)
    if (
      hasQATag(comment.bodyText) &&
      date.subtract(latest_commit_date, comment_date).toDays() <= 0
    ) {
      current_tags.QA = true
    }
    // since comments are in descending order, the first match will define the state
    else if (current_tags.dev_block === '') {
      current_tags.dev_block = hasTags(comment.bodyText)
    }

    if (
      qa_team.includes(comment.author.login) &&
      date.subtract(latest_commit_date, comment_date).toDays() <= 0 &&
      date.isSameDay(comment_date, new Date(utils.getDates()[0]))
    ) {
      current_tags.interacted = true
    }
  })

  return current_tags
}

function hasQATag(comment: string): boolean {
  let regex = new RegExp(signatures.QA + signatures.emoji, 'i')
  return regex.test(comment)
}

// Only checking if dev_block or not
function hasTags(comment: string): string {
  let dev_block = ''
  signatures.tags.forEach(tag => {
    let regex = new RegExp(tag.regex + signatures.emoji, 'i')
    if (regex.test(comment)) {
      dev_block = tag.state.toString()
    }
  })
  return dev_block
}

// Check if the Pull requires QAing
function qaRequired(github_pull: GitHubPullRequest): number {
  let body = github_pull.bodyText || ''
  let qa_regex = new RegExp(signatures.qa_req, 'i')
  const qa = body.match(qa_regex)
  let qa_req = 1

  if (qa?.groups) {
    qa_req = parseInt(qa.groups.qa_req)
  }
  return qa_req
}

// Iteratres through the Pull Object and retrieves the appropriate base properties
function isQAReadyAndInteracted(github_pull: GitHubPullRequest): {qa_ready: boolean, qa_req: number, qa_interacted: boolean} {
  let qa_ready = true
  // Want to skip pulls that are marked as qa_req_0
  let qa_req = qaRequired(github_pull)
  if (!qa_req) {
    qa_ready = false
  }

  let build_status = github_pull.commits?.nodes[0].commit.status?.state ?? 'EXPECTED'
  // Want to skip pulls that are failing CI
  if (build_status !== 'SUCCESS' && build_status !== 'EXPECTED') {
    qa_ready = false
  }

  // Want to skip pulls that are dev_block and already QA'd
  let  tags = getTagsAndInteracted(github_pull)
  if(tags.dev_block === 'true' || tags.QA) {
    qa_ready = false
  }

  return { qa_ready, qa_req, qa_interacted: tags.interacted }
}