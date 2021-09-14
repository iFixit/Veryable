import date from 'date-and-time'
import Pull from './db/db_pull.js'

import config from './config/config.js'
const SIGNATURES = config.signatures
const QA_TEAM = config.qa_team

import logger from './logger.js'
const log = logger('pullParser')

export default function parsePull(github_pull, db_pull = null) {
  log.data(`Parsing Pull #${github_pull.number} ${github_pull.title}`)
  if (db_pull === null) {
    db_pull = new Pull(github_pull)
  }
  const data = { ...db_pull.data }

  updateDates(data, github_pull)
  updateValues(data, github_pull)

  db_pull.setNewValues(data)
}

function updateDates(db_pull_data, github_pull) {
  db_pull_data.updated_at = formatGHDate(github_pull.updatedAt)
  db_pull_data.closed_at = formatGHDate(github_pull.closedAt)
  db_pull_data.merged_at = formatGHDate(github_pull.mergedAt)
}

function formatGHDate(date) {
  return Math.floor(new Date(date).getTime() / 1000)
}

function updateValues(db_pull_data, github_pull) {
  db_pull_data.head_ref = github_pull.headRefOid
  db_pull_data.state = github_pull.state

  db_pull_data.closes = closesDeclared(github_pull)

  qaReadyAndInteracted(db_pull_data, github_pull)
}

// Check if there is an Issue connected with Pull
function closesDeclared(pull) {
  let body = pull.bodyText
  let closes_regex = new RegExp(SIGNATURES.closes, 'i')
  let closes_pull = null
  let __CLOSE

  if ((__CLOSE = body.match(closes_regex)) !== null) {
    closes_pull = parseInt(__CLOSE.groups.closes)
  }
  return closes_pull
}

function qaReadyAndInteracted(db_pull_data, github_pull) {
  let [qa_ready, qa_interacted] = isQAReadyAndInteracted(db_pull_data, github_pull)
  log.data(
    `For Pull #${db_pull_data.pull_number} ${db_pull_data.title} Returned QA Ready: ${qa_ready}, Current QA Ready: ${db_pull_data.qa_ready}, Current QA Count: ${db_pull_data.qa_ready_count},`
  )

  db_pull_data.qa_ready_count += !db_pull_data.qa_ready && qa_ready ? 1 : 0
  db_pull_data.qa_ready = qa_ready

  db_pull_data.interacted_count += !db_pull_data.interacted & qa_interacted ? 1 : 0
  db_pull_data.interacted = qa_interacted
}

// Iteratres through the Pull Object and retrieves the appropriate base properties
function isQAReadyAndInteracted(db_pull_data, github_pull) {
  let build_status = github_pull.commits.nodes[0].commit.status
    ? github_pull.commits.nodes[0].commit.status.state
    : 'EXPECTED'

  let qa_ready = true
  // Want to skip pulls that are marked as qa_req_0
  let qa_req = qaRequired(github_pull)
  if (qa_req) {
    qa_ready = false
    db_pull_data.qa_req = false
  }

  // Want to skip pulls that are failing CI
  if (build_status !== 'SUCCESS' && build_status !== 'EXPECTED') {
    qa_ready = false
  }

  // Want to skip pulls that are dev_block and already QA'd
  let [tags, qa_interacted] = getTagsAndInteracted(github_pull)
  if (tags['dev_block'] || tags['QA']) {
    qa_ready = false
  }

  return [qa_ready, qa_interacted]
}

// Get Signatures/Stamps
function getTagsAndInteracted(github_pull) {
  let latest_commit_date = new Date(github_pull.commits.nodes[0].commit.pushedDate)
  let current_tags = {}
  let interacted = false

  for (const comment of github_pull.comments.nodes) {
    let comment_date = new Date(comment.createdAt)
    if (
      hasQATag(comment.bodyText) &&
      date.subtract(latest_commit_date, comment_date).toDays() <= 0
    ) {
      current_tags['QA'] = true
    } else {
      hasTags(comment.bodyText, current_tags)
    }

    if (
      QA_TEAM.includes(comment.author.login) &&
      date.subtract(latest_commit_date, comment_date).toDays() <= 0 &&
      date.isSameDay(comment_date, new Date())
    ) {
      interacted = true
    }
  }

  return [current_tags, interacted]
}

function hasQATag(comment) {
  let regex = new RegExp(SIGNATURES.QA + SIGNATURES.emoji, 'i')
  return regex.test(comment)
}

function hasTags(comment, tags) {
  SIGNATURES.tags.forEach(tag => {
    let regex = new RegExp(tag.regex + SIGNATURES.emoji, 'i')
    if (regex.test(comment)) {
      tags['dev_block'] = tag.state
    }
  })
}

// Check if the Pull requires QAing
function qaRequired(pull) {
  let body = pull.bodyText
  let qa_regex = new RegExp(SIGNATURES.qa_req, 'i')
  return qa_regex.test(body)
}
