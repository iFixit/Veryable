import { PullRequestHistory, Commit, PullRequest } from '@prisma/client'
import CommitDB from '../db/db_commit'
import Pull from '../db/db_pull';

import logger from '../src/logger'
const log = logger('backfill_controller')


export function backFillCommits(records: PullRequestHistory[], pull: Pull): { [commit_sha: string]: CommitDB } {
  let current_commit_sha: string | null = null;
  let current_commit_state = returnDefaultCommitState();

  const commits: { [commit_sha: string]: Commit } = generateCommitsDictionary(pull.getCommits())

  const backfilled_commits: { [commit_sha: string]: CommitDB} = {}

  records.forEach(record => {
    current_commit_sha = current_commit_sha ?? record.commit_sha

    if (current_commit_sha !== record.commit_sha) {
      backfilled_commits[current_commit_sha] = new CommitDB({
        ...commits[current_commit_sha],
        ...current_commit_state
      })

      current_commit_sha = record.commit_sha
      current_commit_state = returnDefaultCommitState();
    }

    switch (record.event) {
      case 'qa_ready':
        current_commit_state.qa_ready = true
        break;
      case 'non_qa_ready':
        current_commit_state.qa_ready = false
        break;
      case 'dev_blocked':
        current_commit_state.dev_blocked = true
        break;
      case 'un_dev_blocked':
        current_commit_state.dev_blocked = false
        break;
      case 'qa_stamped':
        current_commit_state.qa_stamped = true
        break;
      case 'first_interaction':
      case 'interacted':
        current_commit_state.interacted = true
        break;
    }
  })

  if (current_commit_sha) {
    backfilled_commits[current_commit_sha] = new CommitDB({
      ...commits[current_commit_sha],
      ...current_commit_state
    })
  }

  return backfilled_commits
}

export function backFillPullRequest(records: PullRequestHistory[], pull_request: PullRequest, head_commit: CommitDB, last_pull_dev_block_state: boolean): PullRequest{
  const agg_qa_ready_count = records.filter(record => record.event === 'qa_ready').length;
  const agg_dev_block_count = records.filter(record => record.event === 'dev_blocked').length;
  const agg_qa_stamped_count = records.filter(record => record.event === 'qa_stamped').length;
  const agg_interacted_count = records.filter(record => record.event === 'first_interaction').length

  const backfilled_pull_request = {
    ...pull_request,
    ...head_commit.getCommitState(),
    dev_blocked: last_pull_dev_block_state,
    agg_qa_ready_count,
    agg_dev_block_count,
    agg_interacted_count,
    agg_qa_stamped_count,
  }

  return backfilled_pull_request
}

function generateCommitsDictionary(commits: CommitDB[]): { [commit_event_id: string]: Commit } {
  return commits.reduce(
    (commit_dictionary, commit) => {
      commit_dictionary[commit.getCommitId()] = commit.getCommit()
      return commit_dictionary
    },
    {}
  )
}

function returnDefaultCommitState(): {
    qa_ready: boolean,
    interacted: boolean,
    dev_blocked: boolean,
    qa_stamped: boolean
}{
  return {
    qa_ready: false,
    interacted: false,
    dev_blocked: false,
    qa_stamped: false
  }
}