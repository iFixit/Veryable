import db from '../knex/knex'

import logger from '../src/logger.js'
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

  updateDates(db_pull_data, github_pull) {
    db_pull_data.updated_at = formatGHDate(github_pull.updatedAt)
    db_pull_data.closed_at = formatGHDate(github_pull.closedAt)
    db_pull_data.merged_at = formatGHDate(github_pull.mergedAt)
  }


  updateValues(db_pull_data, github_pull) {
    db_pull_data.head_ref = github_pull.headRefOid
    db_pull_data.state = github_pull.state

    db_pull_data.closes = closesDeclared(github_pull)

    qaReadyAndInteracted(db_pull_data, github_pull)
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
