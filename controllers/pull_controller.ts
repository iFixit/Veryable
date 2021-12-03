import date from 'date-and-time';
import { Pull, qa_pulls_state } from "@prisma/client"

import PullRequest from '../db/db_pull'
import config from '../config/config'
const { qa_team, signatures } = config

import { utils } from '../scripts/utils'

import logger from '../src/logger'
import { IssueComment, Maybe, PullRequest as GitHubPullRequest } from '@octokit/graphql-schema';

const log = logger('pullParser')

export async function parsePull(github_pull: GitHubPullRequest, db_pull: Pull | null): Promise<Pull> {
  log.data(`Parsing Pull #${github_pull.number} ${github_pull.title}`)
  const pull: Pull = grabValues(github_pull, db_pull)
  return await PullRequest.save(pull)
}

function grabValues(github_pull: GitHubPullRequest, db_pull: Pull | null): Pull {
  const { qa_ready, qa_req, qa_interacted } = isQAReadyAndInteracted(github_pull)

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
      repo: github_pull.baseRepository?.nameWithOwner ?? 'unknown',
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
  const body = github_pull.bodyText || ''
  const closes_regex = new RegExp(signatures.closes, 'i')
  const __CLOSE = body.match(closes_regex)

  if (__CLOSE?.groups) {
    return parseInt(__CLOSE.groups.closes)
  }
  return null;
}

// Get Signatures/Stamps
function getTagsAndInteracted(github_pull: GitHubPullRequest): { QA: boolean, dev_block: boolean , interacted: boolean } {
  const latest_commit_date = github_pull.commits?.nodes?.[0]
    ? new Date(github_pull.commits.nodes[0].commit.pushedDate) : new Date();

  const comments = github_pull.comments?.nodes ?? []

  const dev_block = isDevBlocked(comments)

  const QA = comments.some(comment => {
    return isQAed(comment) && date.subtract(latest_commit_date, new Date(comment?.createdAt)).toDays() <= 0
  })

  const interacted = comments.some(comment => {
    const comment_date = new Date(comment?.createdAt)
    return qa_team.includes(comment?.author?.login ?? '') &&
      date.subtract(latest_commit_date, comment_date).toDays() <= 0 &&
      date.isSameDay(comment_date, new Date(utils.getDates()[0]))
  })

  return {
    QA,
    dev_block,
    interacted
  }
}


function isQAed(comment: Maybe<IssueComment>): boolean {
  const regex = new RegExp(signatures.QA + signatures.emoji, 'i')
  return regex.test(comment?.bodyText ?? '')
}

// Only checking if dev_block or not
function isDevBlocked(comments: Maybe<IssueComment>[]): boolean {

  for (const comment of comments) {
    const tag = signatures.tags.find(tag => {
      const regex = new RegExp(tag.regex + signatures.emoji, 'i')
      return regex.test(comment?.bodyText ?? '')
    })
    if (tag) {
      return tag.state
    }
  }

  return false
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

// Iteratres through the Pull Object and retrieves the appropriate base properties
function isQAReadyAndInteracted(github_pull: GitHubPullRequest):{ qa_ready: boolean, qa_req: number, qa_interacted: boolean } {
  const qa_req = qaRequired(github_pull)
  const tags = getTagsAndInteracted(github_pull)
  const qa_ready = isQAReady(github_pull, qa_req, tags)

  return { qa_ready, qa_req, qa_interacted: tags.interacted }
}

function isQAReady(github_pull: GitHubPullRequest, qa_req: number, tags ): boolean {
  if (!qa_req) {
    return false
  }

  const build_status = github_pull.commits?.nodes?.[0]?.commit?.status?.state ?? 'EXPECTED'
  // Want to skip pulls that are failing CI
  if (build_status !== 'SUCCESS' && build_status !== 'EXPECTED') {
    return false
  }

  // Want to skip pulls that are dev_block and already QA'd
  if(tags.dev_block || tags.QA) {
    return false
  }

  return true
}