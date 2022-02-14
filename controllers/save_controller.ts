import CommitDB from '../db/db_commit';
import Pull from '../db/db_pull';
import PullHistoryRecorder from '../db/db_pull_history';
import PullRequestCommitDB from '../db/db_pull_commit';

export async function saveParsedItems(items: { pull_to_save: Pull, pull_history_to_save: PullHistoryRecorder | null }[]) {
  const db_transactions: Promise<void>[] = []
  items.forEach(async (item) => {
    const pull = item.pull_to_save
    const pull_history = item.pull_history_to_save
    const commits = pull.getCommits()

    await pull.save()

    db_transactions.push(...saveCommits(commits))

    if (pull_history) {
      db_transactions.push(pull_history.save())
    }

    db_transactions.push(PullRequestCommitDB.save(pull))
  })

  await Promise.allSettled(db_transactions)
}

function saveCommits(commits: CommitDB[]): Promise<void>[] {
  const db_transactions: Promise<void>[] = []

  commits.forEach((commit) => {
    db_transactions.push(commit.save())
  })

  return db_transactions
}