import { PromisePool } from "@supercharge/promise-pool"
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
    this.current_head_commit = current_head_commit ? utils.deepCopy(current_head_commit) :new CommitDB();
  }

  async save(){
    return PromisePool.for(this.pull_records).process(async record => {
      try {
        await prisma.pullRequestHistory.upsert({
          where: {
            date_pull_request_id_event: {
               date: record.date,
               pull_request_id: record.pull_request_id,
               event: record.event
            }
          },
           update: record,
           create: record
        })
      } catch (err) {
        log.error('Failed to save record %O\n%s', record, err)
      }
    })
  }

  setCurrentCommitRef(commit: CommitDB) {
    this.current_head_commit = utils.deepCopy(commit)
  }

  getCurrentCommit(): Commit {
    return utils.deepCopy(this.current_head_commit.getCommit())
  }

  getPullRecords(): PullRequestHistory[] {
    return utils.deepCopy(this.pull_records)
  }

  // date passed should always be from an already parsed GitHub Object
  logEvent(date: number, event: pull_request_history_event, actor: string) {
    this.pull_records.push({
      start_date: utils.getStartOfDayInUnixTime(date),
      date: date,
      pull_request_id: this.pull_request_id,
      commit_event_id: this.current_head_commit.getID(),
      commit_sha: this.current_head_commit.getSha(),
      event: event,
      actor: actor,
      pull_request_event_index: this.pull_records.length + 1,
    })
  }
}