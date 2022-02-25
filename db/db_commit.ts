import { Commit } from "@prisma/client";
import prisma from "../prisma/client"
import { utils } from "../scripts/utils";

import logger from '../src/logger';
const log = logger('db_commit');

export default class CommitDB {
  commit: Commit

   constructor (commit?: Commit) {
    this.commit = commit ? utils.deepCopy(commit) : {
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

  getPushedDate(): number {
    return this.commit.pushed_at ?? 0
  }

  setQAReadyState(new_qa_ready_state: boolean): void {
    this.commit.qa_ready = new_qa_ready_state
  }

  getQAReadyState(): boolean {
    return this.commit.qa_ready ?? false
  }

  getCommitId(): string {
    return this.commit.commit_event_id
  }

  getSha(): string {
    return this.commit.sha
  }

  getCommit(): Commit {
    return utils.deepCopy(this.commit)
  }

  getDevBlockedState(): boolean {
    return this.commit.dev_blocked ?? false
  }

  getInteractedState(): boolean {
    return this.commit.interacted ?? false
  }

  getQAStampedState(): boolean {
    return this.commit.qa_stamped ?? false
  }

  getCommitState(): { qa_ready: boolean, dev_blocked: boolean, interacted: boolean, qa_stamped: boolean } {
    return {
      qa_ready: this.getQAReadyState(),
      dev_blocked: this.getDevBlockedState(),
      interacted: this.getInteractedState(),
      qa_stamped: this.getQAStampedState()
    }
  }
}