import CommitDB from "../db/db_commit"
import { mock_commit } from "./fixtures"

describe('Commit Class', () => {
  test('Get Pushed Date', () => {
    const commit = new CommitDB(mock_commit)
    expect(commit.getPushedDate()).toBe(1644887820)
  })

  test('Set and Get QA Ready State', () => {
    const commit = new CommitDB(mock_commit)
    expect(commit.getQAReadyState()).toBe(false)
    commit.setQAReadyState(true)
    expect(commit.getQAReadyState()).toBe(true)
  })

  test('Get QA Stamped State', () => {
    let commit = new CommitDB(mock_commit)
    expect(commit.getQAStampedState()).toBe(false)

    commit = new CommitDB({ ...mock_commit, qa_stamped: true })
    expect(commit.getQAStampedState()).toBe(true)
  })
  test('Get Dev Blocked State', () => {
    let commit = new CommitDB(mock_commit)
    expect(commit.getDevBlockedState()).toBe(false)

    commit = new CommitDB({ ...mock_commit, dev_blocked: true })
    expect(commit.getDevBlockedState()).toBe(true)
  })
  test('Get Interacted State', () => {
    let commit = new CommitDB(mock_commit)
    expect(commit.getInteractedState()).toBe(false)

    commit = new CommitDB({ ...mock_commit, interacted: true })
    expect(commit.getInteractedState()).toBe(true)
  })
  test('Get Commit ID', () => {
    const commit = new CommitDB(mock_commit)
    expect(commit.getID()).toBe(mock_commit.commit_event_id)
  })
  test('Get Commit SHA', () => {
    const commit = new CommitDB(mock_commit)
    expect(commit.getSha()).toBe(mock_commit.sha)
  })
  test('Get Commit', () => {
    const commit = new CommitDB(mock_commit)
    expect(commit.getCommit()).toEqual(mock_commit)
  })
  test('Get Commit State', () => {
    let commit = new CommitDB(mock_commit)
    expect(commit.getState()).toEqual({
      qa_ready: false,
      dev_blocked: false,
      interacted: false,
      qa_stamped: false
    })
    commit = new CommitDB({ ...mock_commit, qa_stamped: true, dev_blocked: true })
    expect(commit.getState()).toEqual({
      qa_ready: false,
      dev_blocked: true,
      interacted: false,
      qa_stamped: true
    })
  })
})