import { PromisePool } from "@supercharge/promise-pool"
import Pull from '../db/db_pull';
import PullHistoryRecorder from '../db/db_pull_history';
import PullRequestCommitDB from '../db/db_pull_commit';

import logger from '../src/logger';
import prisma from "../prisma/client";
const log = logger('save_controller');

export async function saveParsedItems(items: { pull_to_save: Pull, pull_history_to_save: PullHistoryRecorder | null }[]) {
  for(const item of items) {
    const pull = item.pull_to_save
    const pull_history = item.pull_history_to_save
    const commits = pull.getCommits()
    try {

      await prisma.$transaction(async () => {
          await pull.save()

          await PromisePool.for(commits).process(commit => commit.save())

          if (pull_history) {
            await pull_history.save()
          }

          await PullRequestCommitDB.save(pull)
      })
    } catch (err) {
      log.error(err)
    }
  }
}