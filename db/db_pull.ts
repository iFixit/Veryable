import prisma from "../prisma/client"
import { Pull } from "@prisma/client"

import logger from '../src/logger'
import config from '../config/config'
import { utils } from '../scripts/utils'

const { signatures } = config
const { qa_team } = config
const log = logger('db_pull')

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
function getTagsAndInteracted(github_pull: GitHubPullRequest): { QA: boolean, dev_block: string, interacted: number } {
  let latest_commit_date = github_pull.commits
    ? new Date(github_pull.commits.nodes[0].commit.pushedDate) : new Date();
  let current_tags = {
    QA: false,
    dev_block: '',
    interacted: 0
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
      current_tags.interacted = 1
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
function isQAReadyAndInteracted(github_pull: GitHubPullRequest): {qa_ready: number, qa_req: number, qa_interacted: number} {
  let qa_ready = 1
  // Want to skip pulls that are marked as qa_req_0
  let qa_req = qaRequired(github_pull)
  if (!qa_req) {
    qa_ready = 0
  }

  let build_status = github_pull.commits?.nodes[0].commit.status?.state ?? 'EXPECTED'
  // Want to skip pulls that are failing CI
  if (build_status !== 'SUCCESS' && build_status !== 'EXPECTED') {
    qa_ready = 0
  }

  // Want to skip pulls that are dev_block and already QA'd
  let  tags = getTagsAndInteracted(github_pull)
  if(tags.dev_block === 'true' || tags.QA) {
    qa_ready = 0
  }

  return { qa_ready, qa_req, qa_interacted: tags.interacted }
}

//TODO: move to actual ORM like Prisma for easier model configuration and declaration
export default class PullRequest {
  data: Pull;

  //Empty Constructor
  constructor () {
    this.data = {
      closed_at: null,
      closes: null,
      created_at: 0,
      head_ref: '',
      interacted_count: 0,
      interacted: false,
      merged_at: null,
      pull_number: 0,
      qa_ready_count: 0,
      qa_ready: false,
      qa_req: 1,
      repo: '',
      state: 'OPEN',
      title: '',
      updated_at: 0,
    };
  }

   // Create new Pull and map values from GitHub Pull
  static fromGitHub(github_pull: GitHubPullRequest): Pull {
    const gh_pull = new PullRequest();
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
    const pull = new PullRequest();
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
     await prisma.pull.upsert({
        where: {
          repo_pull_number: {
            repo: this.data.repo,
            pull_number: this.data.pull_number,
          }
        },
        update: this.data,
        create: this.data,
      })
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
    return prisma.pull.findMany({where: {state: 'OPEN'}})
  }

  //TODO: Only return QA_ready pulls on pulls that are still open
  // Case is where the qa_ready value does not change but the state does
  static async getQAReadyPullCount(): Promise<number> {
    return prisma.pull.count(
      {
        where: {
          qa_ready: true,
          state: 'OPEN'
        }
    })
  }

  //TODO: Add conditional to be within single day range
  //Will also include pulls that are still open passed creation date
  static async getQAReadyUniquePullCount(day: number): Promise<number> {
     return prisma.pull.count(
      {
        where: {
          qa_ready_count: {
            gte: 1
          },
          created_at: {
            gte: day
          }
        }
    })
  }

  //TODO : This query will not work if the pull is updated on the day but no change to interaction has been done.
  // This also does not consider pulls currently marked as non-interacted but have been interacted for the day
  static async getInteractionsCount(day: number): Promise<number> {
    return prisma.pull.count(
      {
        where: {
          interacted_count: {
            gte: 1
          },
          updated_at: {
            gte: day
          }
        }
      }
    )
  }
}
