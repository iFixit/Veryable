import CommitDB from "../db/db_commit"
import PullHistoryRecorder from "../db/db_pull_history"
import { mock_commit, mock_pull_request } from "./fixtures"


const pull_request_id = mock_pull_request.pull_request_id
const commit = new CommitDB(mock_commit)

describe("Pull History Recorder Class", () => {
  test('Set and Get Current Commit Ref', () => {
    const recorder = new PullHistoryRecorder(pull_request_id)
    expect(recorder.getCurrentCommit()).toEqual(new CommitDB().getCommit())

    recorder.setCurrentCommitRef(commit)
    expect(recorder.getCurrentCommit()).toEqual(commit.getCommit())
  })

  test('Log Event and Get Records', () => {
    const recorder = new PullHistoryRecorder(pull_request_id,commit)

    expect(recorder.getPullRecords()).toEqual([])
    recorder.logEvent(1636608908, 'qa_ready', 'test')
    recorder.logEvent(1636609102, 'dev_blocked', 'testing')

    expect(recorder.getPullRecords()).toEqual([
      {
        start_date: 1636531200,
        date: 1636608908,
        pull_request_id: mock_pull_request.pull_request_id,
        commit_event_id: mock_commit.commit_event_id,
        commit_sha: mock_commit.sha,
        event: 'qa_ready',
        actor: 'test',
        pull_request_event_index: 1
      },
      {
        start_date: 1636531200,
        date: 1636609102,
        pull_request_id: mock_pull_request.pull_request_id,
        commit_event_id: mock_commit.commit_event_id,
        commit_sha: mock_commit.sha,
        event: 'dev_blocked',
        actor: 'testing',
        pull_request_event_index: 2
      }
    ])
  })

  test('Log Events with Setting New Commit', () => {
    const recorder = new PullHistoryRecorder(pull_request_id,commit)

    expect(recorder.getPullRecords()).toEqual([])
    recorder.logEvent(1636608908, 'qa_ready', 'test')
    recorder.logEvent(1636609102, 'dev_blocked', 'testing')

    const new_commit = new CommitDB({
      commit_event_id: 'MDM6UmVmMzkyNzcyNDA6cmVmcy9oZWFkcy9sZXRzLXRyeS1jaGFrcmE=',
      sha: '85de4c22218823afb85b547249cb255f5ef7b1a7',
      ci_status: 'SUCCESS',
      committed_at: 1643050892,
      pull_request_id: pull_request_id,
      pushed_at: 1643050892,
      qa_ready: false,
      interacted: false,
      dev_blocked: false,
      qa_stamped: false
    })

    recorder.setCurrentCommitRef(new_commit)
    recorder.logEvent(1643050892,'qa_ready','CI')

    expect(recorder.getPullRecords()).toEqual([
      {
        start_date: 1636531200,
        date: 1636608908,
        pull_request_id: mock_pull_request.pull_request_id,
        commit_event_id: mock_commit.commit_event_id,
        commit_sha: mock_commit.sha,
        event: 'qa_ready',
        actor: 'test',
        pull_request_event_index: 1
      },
      {
        start_date: 1636531200,
        date: 1636609102,
        pull_request_id: mock_pull_request.pull_request_id,
        commit_event_id: mock_commit.commit_event_id,
        commit_sha: mock_commit.sha,
        event: 'dev_blocked',
        actor: 'testing',
        pull_request_event_index: 2
      },
      {
        start_date: 1643011200,
        date: 1643050892,
        pull_request_id: mock_pull_request.pull_request_id,
        commit_event_id: new_commit.getID(),
        commit_sha: new_commit.getSha(),
        event: 'qa_ready',
        actor: 'CI',
        pull_request_event_index: 3
      }
    ])
  })
})