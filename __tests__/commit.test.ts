import { Commit } from "@prisma/client"
import CommitDB from "../db/db_commit"


const mock_commit_data: Commit = {
  commit_event_id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
  sha: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
  ci_status: 'SUCCESS',
  committed_at: 1636608908,
  pull_request_id: 'PR_kwDOACywbc4zH04S',
  pushed_at: 1636608908,
  qa_ready: false,
  interacted: false,
  dev_blocked: false,
  qa_stamped: false
}

describe('Commit Class', () => {
  test('Get Pushed Date', () => {
    const commit = new CommitDB(mock_commit_data)
    expect(commit.getPushedDate()).toBe(1636608908)
  })

  test('Set and Get QA Ready State', () => {
    const commit = new CommitDB(mock_commit_data)
    expect(commit.getQAReadyState()).toBe(false)
    commit.setQAReadyState(true)
    expect(commit.getQAReadyState()).toBe(true)
  })

  test('Get QA Stamped State', () => {
    let commit = new CommitDB(mock_commit_data)
    expect(commit.getQAStampedState()).toBe(false)

    commit = new CommitDB({ ...mock_commit_data, qa_stamped: true })
    expect(commit.getQAStampedState()).toBe(true)
  })
  test('Get Dev Blocked State', () => {
    let commit = new CommitDB(mock_commit_data)
    expect(commit.getDevBlockedState()).toBe(false)

    commit = new CommitDB({ ...mock_commit_data, dev_blocked: true })
    expect(commit.getDevBlockedState()).toBe(true)
  })
  test('Get Interacted State', () => {
    let commit = new CommitDB(mock_commit_data)
    expect(commit.getInteractedState()).toBe(false)

    commit = new CommitDB({ ...mock_commit_data, interacted: true })
    expect(commit.getInteractedState()).toBe(true)
  })
  test('Get Commit ID', () => {
    const commit = new CommitDB(mock_commit_data)
    expect(commit.getID()).toBe('PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA')
  })
  test('Get Commit SHA', () => {
    const commit = new CommitDB(mock_commit_data)
    expect(commit.getSha()).toBe('34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168')
  })
  test('Get Commit', () => {
    const commit = new CommitDB(mock_commit_data)
    expect(commit.getCommit()).toEqual(mock_commit_data)
  })
  test('Get Commit State', () => {
    let commit = new CommitDB(mock_commit_data)
    expect(commit.getState()).toEqual({
      qa_ready: false,
      dev_blocked: false,
      interacted: false,
      qa_stamped: false
    })
    commit = new CommitDB({ ...mock_commit_data, qa_stamped: true, dev_blocked: true })
    expect(commit.getState()).toEqual({
      qa_ready: false,
      dev_blocked: true,
      interacted: false,
      qa_stamped: true
    })
  })
})