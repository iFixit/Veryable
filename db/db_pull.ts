import prisma from "../prisma/client"
import { PullRequest } from "@prisma/client"

import logger from '../src/logger'

const log = logger('db_pull')

export default class Pull {
  // Returns string format of primary key
  static getUniqueID(pull_request: PullRequest): string {
    return `${pull_request.repo} #${pull_request.pull_number}`
  }

  // Retrive values needed for GitHub Graphql call
  static getGraphQLValues(pull_request: PullRequest): [{name: string, owner: string}, number] {
    const split = pull_request.repo.split('/')
    const repo = {
      name: split[1],
      owner: split[0],
    }
    return [repo, pull_request.pull_number]
  }

  // Insert / Update Pull Request into the DB
  static async save(pull_request: PullRequest): Promise<PullRequest> {
    try {
      return await prisma.pullRequest.upsert({
        where: {
          repo_pull_number: {
            repo: pull_request.repo,
            pull_number: pull_request.pull_number,
          }
        },
        update: pull_request,
        create: pull_request,
      })
    } catch (e) {
      log.error(
        "Failed to save Pull #%d '%s\n\t%s",
        pull_request.pull_number,
        pull_request.title,
        e
      )
      throw e
    }
  }

  static async getDBPulls(): Promise<PullRequest[]> {
    return prisma.pullRequest.findMany({where: {state: 'OPEN'}})
  }

  //TODO: Only return QA_ready pulls on pulls that are still open
  // Case is where the qa_ready value does not change but the state does
  static async getQAReadyPullCount(): Promise<number> {
    return prisma.pullRequest.count(
      {
        where: {
          qa_ready: true,
          state: 'OPEN'
        }
    })
  }

  //TODO: Add conditional to be within single day range
  //Will also include pulls that are still open past creation date
  static async getQAReadyUniquePullCount(day: number): Promise<number> {
     return prisma.pullRequest.count(
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
    return prisma.pullRequest.count(
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
