import { Commit, PullRequestHistory, pull_request_history_event } from "@prisma/client";
import prisma from "../prisma/client"

import CommitDB from '../db/db_commit'
import Pull from "./db_pull";

import logger from '../src/logger';
import { utils } from "../scripts/utils";
const log = logger('db_pull_history');

export default class PullHistoryRecorder {
  pull_records: PullRequestHistory[] = [];
  pull_request_id: string;
  current_head_commit: CommitDB;

  constructor (pull_request_id: string, current_head_commit?: CommitDB) {
    this.pull_request_id = pull_request_id;
    this.current_head_commit = current_head_commit ?? new CommitDB();
  }

  async save(): Promise<void> {
    log.data('Saving events %O', this.pull_records)
    await Promise.allSettled(this.pull_records.map(async event => {
      try {
        await prisma.pullRequestHistory.upsert({
          where: {
            date_pull_request_id_event: {
              date: event.date,
              pull_request_id: event.pull_request_id,
              event: event.event
            }
          },
          update: event,
          create: event
        })
      } catch (err) {
        log.error('Failed to save event %O\n%s', event, err)
      }
    }))
  }

  setCurrentCommitRef(commit: CommitDB) {
    this.current_head_commit = commit
  }

  // date passed should always be from an already parsed GitHub Object
  logEvent(date: number, event: pull_request_history_event, actor: string) {
    this.pull_records.push({
      start_date: utils.getZeroHourFromDate(date),
      date: date,
      pull_request_id: this.pull_request_id,
      commit_event_id: this.current_head_commit.getCommitId(),
      commit_sha: this.current_head_commit.getSha(),
      event: event,
      actor: actor,
      pull_request_event_index: this.pull_records.length + 1,
    })
  }
}