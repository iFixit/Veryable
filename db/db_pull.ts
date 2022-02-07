import prisma from "../prisma/client"
import { PullRequest } from "@prisma/client"

import logger from '../src/logger'
import CommitDB from "./db_commit"

const log = logger('db_pull')

export default class Pull {
  pull_request: PullRequest
  commits: CommitDB[] = []

  constructor (pull_request: PullRequest, commits: CommitDB[] | null = null) {
    this.pull_request = pull_request
    this.commits = commits ? [...commits] : []
  }

  // Returns string format of primary key
  // Will remove down the line as we change index.ts
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
  async save(): Promise<void> {
    try {
      this.pull_request = await prisma.pullRequest.upsert({
        where: {
          pull_request_id: this.pull_request.pull_request_id
        },
        update: this.pull_request,
        create: this.pull_request,
      })
    } catch (e) {
      log.error(
        "Failed to save PullRequest #%d '%s\n\t%s",
        this.pull_request.pull_number,
        this.pull_request.title,
        e
      )
      throw e
    }
  }

  getID(): string {
    return this.pull_request.pull_request_id
  }

  getAuthor(): string{
    return this.pull_request.author
  }

  getCommits(): CommitDB[]{
    return this.commits
  }

  getHeadCommitSha(): string{
    return this.pull_request.head_ref
  }

  appendCommit(commit: CommitDB) {
    this.commits.push(commit)
  }

  getNumberOfCommits(): number{
    return this.commits.length
  }

  isQARequired(): boolean{
    return this.pull_request.qa_req > 0 ? true : false;
  }

  setPullRequest(pull_request: PullRequest): void{
    this.pull_request = {...pull_request}
  }

  getPullRequest(): PullRequest {
    return { ...this.pull_request }
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
          agg_qa_ready_count: {
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
          agg_interacted_count: {
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
