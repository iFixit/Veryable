import CommitDB from '../db/db_commit'
import Pull from '../db/db_pull'
import { Commit, commit_ci_status } from "@prisma/client"

import { utils } from "../scripts/utils"

import { PullRequestCommit } from '@octokit/graphql-schema';

import logger from '../src/logger';
const log = logger('commit_controller');

export function parseCommit(pull: Pull, github_commit: PullRequestCommit): CommitDB {
  const commit: Commit = {
    commit_event_id: github_commit.id,
    sha: github_commit.commit.oid,
    qa_ready: false,
    interacted: false,
    dev_blocked: false,
    qa_stamped: false,
    ci_status: github_commit.commit.status?.state || null,
    committed_at: utils.getUnixTimeFromISO(github_commit.commit.committedDate),
    pushed_at: github_commit.commit.pushedDate ? utils.getUnixTimeFromISO(github_commit.commit.pushedDate) : null,
    pull_request_id: null
  }

  return new CommitDB(commit)
}

// Non-null pushed_at date means it was the last commit pushed to the remote repo from a batch of locally created commits
// Therefore, it is the commit that will have CI ran on it
export function isCommitQAReady(dev_blocked: boolean, commit: Commit): boolean {
  return commit.pushed_at !== null && isCommitStatusGood(commit) && !dev_blocked;
}

export function isCommitStatusGood(commit: Commit): boolean {
  return commit.ci_status === 'SUCCESS' || commit.ci_status === 'EXPECTED' || commit.ci_status === null;
}
