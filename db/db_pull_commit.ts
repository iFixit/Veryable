import prisma from "../prisma/client"

import logger from '../src/logger';
import Pull from "./db_pull";
const log = logger('db_pull_commit');

export default class PullRequestCommitDB {

  static async save(pull: Pull): Promise<void> {
    try {
      await prisma.pullRequestCommit.upsert({
      where: {
        pull_request_id: pull.getID()
      },
      update: {
        head_commit_id: pull.getHeadCommit().getCommitId()
      },
      create: {
        pull_request_id: pull.getID(),
        head_commit_id: pull.getHeadCommit().getCommitId()
      }})
  } catch (e) {
      log.error("Error Saving PullRequestCommit %O",e)
      throw e
    }
  }
}