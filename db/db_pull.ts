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

  static fromGithub() { }

  static fromDataBase(db_pull: PullRequest): Pull {
    const pull = new Pull();
    pull.data = { ...db_pull };
    return pull;
  }
  // Retrieves the Repo and Pull Number in a formatted string
  getUniqueID() {
    return `${this.data.repo} #${this.data.pull_number}`
  }

  // Retrieves the Repo Owner, Repo Name, and Pull Number
  getGraphQLValues() {
    let split = this.data.repo.split('/')
    let repo = {
      name: split[1],
      owner: split[0],
    }
    return [repo, this.data.pull_number]
  }

  async save() {
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

  async setNewValues(data) {
    this.data = { ...data }
    await this.save()
  }

  static async getDBPulls() {
    const rows = await db('qa_pulls').select().where({ state: 'OPEN' })
    const db_pulls: Pull[] = []

    for (let row of rows) {
      db_pulls.push(Pull.fromDataBase(row))
    }

    return db_pulls
  }

  //TODO: Only return QA_ready pulls on pulls that are still open
  // Case is where the qa_ready value does not change but the state does
  static async getQAReadyPullCount() {
    let result = await db('qa_pulls')
      .count('qa_ready as running_pull_total')
      .where({ qa_ready: 1 })
      .andWhere({ state: 'OPEN' })
    return result[0].running_pull_total
  }

  static async getQAReadyUniquePullCount() {
    let today = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    let result = await db('qa_pulls')
      .count('qa_ready_count as unique_pulls_added')
      .where('qa_ready_count', '>', 0)
      .andWhere('created_at', '>=', today)
    log.data("Get Unique Pull Count Today's value: " + today)
    return result[0].unique_pulls_added
  }

  static async getInteractionsCount() {
    let today = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    let result = await db('qa_pulls')
      .count('interacted as pulls_interacted')
      .where({ interacted: 1 })
      .andWhere('updated_at', '>=', today)
    return result[0].pulls_interacted
  }
}
