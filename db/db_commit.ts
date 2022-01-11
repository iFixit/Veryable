import { Commit } from "@prisma/client";
import prisma from "../prisma/client"

import logger from '../src/logger';
const log = logger('db_commit');

export default class CommitDB {
  commit: Commit

   constructor (commit?: Commit) {
    this.commit = commit ? { ...commit } : {
      commit_event_id: '',
      sha: '',
      qa_ready: null,
      interacted: null,
      dev_blocked: null,
      qa_stamped: null,
      ci_status: null,
      committed_at: 0,
      pushed_at: null,
      pull_request_id: null,
    }
   }

  async save(): Promise<void> {
    if (this.commit.sha !== null) {
      try {
        this.commit = await prisma.commit.upsert({
          where: {
            commit_event_id: this.commit.commit_event_id,
          },
          update: this.commit,
          create: this.commit
        })
      } catch (e) {
        log.error(
          "Failed to save Commit %O\n\t%s",
          this.commit,
          e
        )
        throw e
      }
    } else {
      log.error(
        "Failed to save Commit because it has not been intiliazed correctly %O",
        this.commit,
      )
    }
  }
}