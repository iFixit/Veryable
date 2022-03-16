import prisma from "../prisma/client"
import { PullRequest } from "@prisma/client"

import logger from '../src/logger'
import CommitDB from "./db_commit"

import {utils} from "../scripts/utils"

const log = logger('db_pull')


type PullState = {
  qa_stamped: boolean,
  interacted: boolean,
  dev_blocked: boolean
  qa_ready: boolean
}
export default class Pull {
  pull_request: PullRequest
  commits: CommitDB[] = []
  head_commit: CommitDB
  pull_state: PullState = {
    qa_stamped: false,
    interacted: false,
    dev_blocked: false,
    qa_ready: false
  }

  constructor (pull_request: PullRequest, commits: CommitDB[] | null = null, head_commit: CommitDB | null = null) {
    this.pull_request = utils.deepCopy(pull_request);
    this.commits = commits ? utils.deepCopy(commits) : []
    this.head_commit = head_commit ? utils.deepCopy(head_commit) : new CommitDB()
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

  async save(): Promise<void> {
    try {
      if (await this.existsInDB()) {
        await this.deleteFromDB();
      }
      this.pull_request = await prisma.pullRequest.create({
        data: this.pull_request
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

  async existsInDB(): Promise<boolean> {
    try {
      const result = await prisma.pullRequest.findUnique({
        where: {
          pull_request_id: this.pull_request.pull_request_id
        }
      })
      if (result) {
        log.info('Pull exists, purging to create clean history')
        return true
      }
      return false
    } catch (e) {
      log.error(
        "Failed to find PullRequest #%d '%s\n\t%s",
          this.pull_request.pull_number,
          this.pull_request.title,
          e
      )
      throw e
    }
  }

  async deleteFromDB(): Promise<void> {
    try {
      await prisma.pullRequest.delete({
        where: {
          pull_request_id: this.pull_request.pull_request_id
        }
      })
    } catch (e) {
      log.error(
        "Failed to delete PullRequest #%d '%s\n\t%s",
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
    return utils.deepCopy(this.commits)
  }

  getHeadCommitSha(): string{
    return this.pull_request.head_ref
  }

  getHeadCommit(): CommitDB {
    return utils.deepCopy(this.head_commit)
  }

  appendCommit(commit: CommitDB) {
    this.commits.push(utils.deepCopy(commit))
  }

  getNumberOfCommits(): number{
    return this.commits.length
  }

  isQARequired(): boolean{
    return this.pull_request.qa_req > 0 ? true : false;
  }

  setQARequired(stamps: number): void{
    this.pull_request.qa_req = stamps
  }

  wasInteractedWith(): boolean{
    return this.pull_state.interacted;
  }
  setInteractedState(new_interacted_state: boolean): void{
    this.pull_state.interacted = new_interacted_state
  }

  isDevBlocked(): boolean{
    return this.pull_state.dev_blocked
  }
  setDevBlockedState(new_dev_blocked_state: boolean): void{
    this.pull_state.dev_blocked = new_dev_blocked_state
  }

  isQAed(): boolean{
    return this.pull_state.qa_stamped
  }

  setQAStampedState(new_qa_stamped_state: boolean): void{
    this.pull_state.qa_stamped = new_qa_stamped_state
  }

  isQAReady(): boolean{
    return this.pull_state.qa_ready
  }
  setQAReadyState(new_qa_ready_state: boolean): void{
    this.pull_state.qa_ready = new_qa_ready_state
  }

  setPullRequest(pull_request: PullRequest): void{
    this.pull_request = utils.deepCopy(pull_request);
  }

  getPullRequest(): PullRequest {
    return utils.deepCopy(this.pull_request)
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
