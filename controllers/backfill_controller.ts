import { PullRequestHistory, Commit } from '@prisma/client'
import CommitDB from '../db/db_commit'
import Pull from '../db/db_pull';

import logger from '../src/logger'
const log = logger('backfill_controller')


export function backFillCommits(records: PullRequestHistory[], pull: Pull): { [commit_event_id: string]: CommitDB } {
  let current_commit_id: string | null = null;
  let current_commit_state = returnDefaultCommitState();

  const commits: { [commit_event_id: string]: Commit } = generateCommitsDictionary(pull.getCommits())

  const backfilled_commits: { [commit_event_id: string]: CommitDB} = {}

  records.forEach(record => {
    current_commit_id = current_commit_id ?? record.commit_event_id

    if (current_commit_id !== record.commit_event_id) {
      backfilled_commits[current_commit_id] = new CommitDB({
        ...commits[current_commit_id],
        ...current_commit_state
      })

      current_commit_id = record.commit_event_id
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

  if (current_commit_id) {
    backfilled_commits[current_commit_id] = new CommitDB({
      ...commits[current_commit_id],
      ...current_commit_state
    })
  }

  return backfilled_commits
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