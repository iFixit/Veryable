import { backFillCommits, backFillPullRequest} from "../controllers/backfill_controller";
import CommitDB from "../db/db_commit";
import Pull from "../db/db_pull";
import { expected_updated_mock_commits, mock_commits, mock_head_commit, mock_pull_request, mock_records } from "./fixtures";

describe('Validate Back Filling', () => {
  describe('Validate Commit Back Filling', () => {
    test('Backfill Commits', () => {
      const pull = new Pull(mock_pull_request, mock_commits,new CommitDB(mock_head_commit))
      const updated_commits = backFillCommits(mock_records, pull)
      expect(updated_commits).toEqual(expected_updated_mock_commits)
      })
    })

  describe('Validate Pull Request Back Filling', () => {
    test('Confirm Aggregated Counts', () => {
      const backfilled_pull_request = backFillPullRequest(mock_records, mock_pull_request, new CommitDB(mock_head_commit), false)

      expect(backfilled_pull_request.agg_qa_ready_count).toBe(5)
      expect(backfilled_pull_request.agg_dev_block_count).toBe(3)
      expect(backfilled_pull_request.agg_qa_stamped_count).toBe(3)
      expect(backfilled_pull_request.agg_interacted_count).toBe(4)
    })

    test('Confirm Pull State based off Head Commit', () => {
      const head_commit = new CommitDB({
        ...mock_head_commit,
        qa_stamped: true,
        qa_ready: false,
        interacted: true,
        dev_blocked: false
      })

      const backfilled_pull_request = backFillPullRequest(mock_records, mock_pull_request, head_commit, false)

      expect(backfilled_pull_request.qa_ready).toBe(false)
      expect(backfilled_pull_request.qa_stamped).toBe(true)
      expect(backfilled_pull_request.interacted).toBe(true)
      expect(backfilled_pull_request.dev_blocked).toBe(false)
    })

    test('Confirm Pull is Dev Blocked even if Head Commit is not Dev Blocked', () => {
      const head_commit = new CommitDB({
        ...mock_head_commit,
        qa_stamped: false,
        qa_ready: false,
        interacted: false,
        dev_blocked: false
      })

      const backfilled_pull_request = backFillPullRequest(mock_records, mock_pull_request, head_commit, true)

      expect(backfilled_pull_request.qa_ready).toBe(false)
      expect(backfilled_pull_request.qa_stamped).toBe(false)
      expect(backfilled_pull_request.interacted).toBe(false)
      expect(backfilled_pull_request.dev_blocked).toBe(true)
    })
  })
})