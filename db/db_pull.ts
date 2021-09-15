import date from 'date-and-time'
import db from '../knex/knex'

import logger from '../src/logger'
import config from '../config/config'
import { utils } from '../scripts/utils'

const { signatures } = config
const { qa_team } = config
const log = logger('db_pull')

interface PullRequest {
  closed_at: null | number,
  closes: null | number,
  created_at: null | number,
  head_ref: string,
  interacted_count: number,
  interacted: number,
  merged_at: null | number,
  pull_number: number,
  qa_ready_count: number,
  qa_ready: number,
  qa_req: number,
  repo: string,
  state: string,
  title: string,
  updated_at: null | number,
}

function formatGHDate(utc_date: string | null): number | null {
  if (utc_date) {
    return Math.floor(new Date(utc_date).getTime() / 1000);
  }
  return null;
}

// Check if there is an Issue connected with Pull
function closesDeclared(pull) {
  let body = pull.bodyText
  let closes_regex = new RegExp(signatures.closes, 'i')
  let closes_pull = null
  let __CLOSE

  if ((__CLOSE = body.match(closes_regex)) !== null) {
    closes_pull = parseInt(__CLOSE.groups.closes)
  }
  return closes_pull
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
      qa_team.includes(comment.author.login) &&
      date.subtract(latest_commit_date, comment_date).toDays() <= 0 &&
      date.isSameDay(comment_date, new Date())
    ) {
      interacted = true
    }
  }

  return [current_tags, interacted]
}

function hasQATag(comment) {
  let regex = new RegExp(signatures.QA + signatures.emoji, 'i')
  return regex.test(comment)
}

function hasTags(comment, tags) {
  signatures.tags.forEach(tag => {
    let regex = new RegExp(tag.regex + signatures.emoji, 'i')
    if (regex.test(comment)) {
      tags['dev_block'] = tag.state
    }
  })
}

// Check if the Pull requires QAing
function qaRequired(pull) {
  let body = pull.bodyText
  let qa_regex = new RegExp(signatures.qa_req, 'i')
  return qa_regex.test(body)
}

// Iteratres through the Pull Object and retrieves the appropriate base properties
function isQAReadyAndInteracted(github_pull: GitHubPullRequest): {qa_ready: number, qa_req: number, qa_interacted: number} {
  let build_status = github_pull.commits.nodes[0].commit.status
    ? github_pull.commits.nodes[0].commit.status.state
    : 'EXPECTED'

  let qa_ready = 1
  // Want to skip pulls that are marked as qa_req_0
  let qa_req = qaRequired(github_pull)
  if (qa_req) {
    qa_ready = 0
  }

  // Want to skip pulls that are failing CI
  if (build_status !== 'SUCCESS' && build_status !== 'EXPECTED') {
    qa_ready = 0
  }

  // Want to skip pulls that are dev_block and already QA'd
  let [tags, qa_interacted] = getTagsAndInteracted(github_pull)
  if (tags['dev_block'] || tags['QA']) {
    qa_ready = 0
  }

  return { qa_ready, qa_req, qa_interacted }
}

//TODO: move to actual ORM like Prisma for easier model configuration and declaration
export default class Pull {
  data: PullRequest;

  //Empty Constructor
  constructor () {
    this.data = {
      closed_at: null,
      closes: null,
      created_at: 0,
      head_ref: '',
      interacted_count: 0,
      interacted: 0,
      merged_at: null,
      pull_number: 0,
      qa_ready_count: 0,
      qa_ready: 0,
      qa_req: 1,
      repo: '',
      state: '',
      title: '',
      updated_at: 0,
    };
  }

   // Create new Pull and map values from GitHub Pull
  static fromGitHub(github_pull: GitHubPullRequest): Pull {
    const gh_pull = new Pull();
    gh_pull.data = {
      closed_at: formatGHDate(github_pull.closedAt),
      closes: null,
      created_at: formatGHDate(github_pull.createdAt),
      head_ref: github_pull.headRefOid,
      interacted_count: 0,
      interacted: 0,
      merged_at: formatGHDate(github_pull.mergedAt),
      pull_number: github_pull.number,
      qa_ready_count: 0,
      qa_ready: 0,
      qa_req: 1,
      repo: github_pull.baseRepository.nameWithOwner,
      state: github_pull.state,
      title: github_pull.title,
      updated_at: formatGHDate(github_pull.updatedAt),
    };
    return gh_pull;
  }

  static fromDataBase(db_pull: PullRequest): Pull {
    const pull = new Pull();
    pull.data = { ...db_pull };
    return pull;
  }
  // Returns string formate of primary key
  getUniqueID():string {
    return `${this.data.repo} #${this.data.pull_number}`
  }

  // Retrive values needed for GitHub Graphql call
  getGraphQLValues(): [{name: string, owner: string}, number] {
    let split = this.data.repo.split('/')
    let repo = {
      name: split[1],
      owner: split[0],
    }
    return [repo, this.data.pull_number]
  }

  // Insert / Update Pull Request into the DB
  async save(): Promise<void> {
    try {
      await db('qa_pulls')
        .insert({ ...this.data })
        .onConflict(['repo', 'pull_number'])
        .merge()
    } catch (e) {
      log.error(
        "Failed to save Pull #%d '%s\n\t%s",
        this.data.pull_number,
        this.data.title,
        new Error()
      )
    }
  }

  updateDates(github_pull: GitHubPullRequest): void {
    this.data.closed_at = formatGHDate(github_pull.closedAt);
    this.data.created_at = formatGHDate(github_pull.createdAt);
    this.data.updated_at = formatGHDate(github_pull.updatedAt);
    this.data.merged_at = formatGHDate(github_pull.mergedAt);
  }


  updateValues(github_pull: GitHubPullRequest): void {
    this.data.head_ref = github_pull.headRefOid;
    this.data.state = github_pull.state;
    this.data.closes = closesDeclared(github_pull);
    this.updateDates(github_pull);
    this.qaReadyAndInteracted(github_pull);
  }

  qaReadyAndInteracted(github_pull: GitHubPullRequest): void {
    let { qa_ready, qa_req, qa_interacted } = isQAReadyAndInteracted(github_pull)
    log.data(
      `For Pull #${this.data.pull_number} ${this.data.title} Returned QA Ready: ${qa_ready}, Current QA Ready: ${this.data.qa_ready}, Current QA Count: ${this.data.qa_ready_count},`
    )
    this.data.qa_req = qa_req;
    this.data.qa_ready_count += !this.data.qa_ready && qa_ready ? 1 : 0
    this.data.qa_ready = qa_ready

    this.data.interacted_count += !this.data.interacted && qa_interacted ? 1 : 0
    this.data.interacted = qa_interacted
  }


  async setNewValues(data: PullRequest): Promise<void> {
    this.data = { ...data }
    await this.save()
  }

  static async getDBPulls(): Promise<Pull[]> {
    const rows = await db('qa_pulls').select().where({ state: 'OPEN' })
    const db_pulls: Pull[] = []

    for (let row of rows) {
      db_pulls.push(Pull.fromDataBase(row))
    }

    return db_pulls
  }

  //TODO: Only return QA_ready pulls on pulls that are still open
  // Case is where the qa_ready value does not change but the state does
  static async getQAReadyPullCount(): Promise<number> {
    let result = await db('qa_pulls')
      .count('qa_ready as running_pull_total')
      .where({ qa_ready: 1 })
      .andWhere({ state: 'OPEN' })
    return result[0].running_pull_total as number
  }

  static async getQAReadyUniquePullCount(): Promise<number> {
    let today = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    let result = await db('qa_pulls')
      .count('qa_ready_count as unique_pulls_added')
      .where('qa_ready_count', '>', 0)
      .andWhere('created_at', '>=', today)
    log.data("Get Unique Pull Count Today's value: " + today)
    return result[0].unique_pulls_added as number
  }

  static async getInteractionsCount(): Promise<number> {
    let today = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    let result = await db('qa_pulls')
      .count('interacted as pulls_interacted')
      .where({ interacted: 1 })
      .andWhere('updated_at', '>=', today)
    return result[0].pulls_interacted as number
  }
}
