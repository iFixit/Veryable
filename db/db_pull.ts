import prisma from "../prisma/client"
import { Pull } from "@prisma/client"

import logger from '../src/logger'
import config from '../config/config'

const log = logger('db_pull')

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
