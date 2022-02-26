import { IssueComment } from "@octokit/graphql-schema"
import { checkAndRecordDevBlockSignature, checkAndRecordInteraction, checkAndRecordQAedSignature, handleCommentEvent, handleIssueCommentEvent, handlePullRequestCommitEvent } from "../controllers/pull_history_controller"
import CommitDB from "../db/db_commit"
import Pull from "../db/db_pull"
import PullHistoryRecorder from "../db/db_pull_history"
import { GitHubMocks, mock_commit, mock_pull_request } from "./fixtures"

const pull = new Pull(mock_pull_request)
const commit = new CommitDB(mock_commit)

describe('Validate Parsing Pull Timeline Items', () => {
  describe('Validate QAed Recording', () => {
    test('No Events Recorded if No QAed Signature', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const qaed = false
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordQAedSignature(qaed, GitHubMocks.Comment.no_signatures as IssueComment, recorder)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(0)
    })

    test('Record QAed Event', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const qaed = true
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordQAedSignature(qaed, GitHubMocks.Comment.qaed as IssueComment, recorder)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(2)
      expect(records).toEqual([{
        start_date: 1638345600,
        date: 1638385133,
        pull_request_id: pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'qa_stamped',
        actor: 'mcTestyFace',
        pull_request_event_index: 1
      },
      {
        start_date: 1638345600,
        date: 1638385133,
        pull_request_id: pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'non_qa_ready',
        actor: 'mcTestyFace',
        pull_request_event_index: 2
      }])
    })
  })
  describe('Validate Dev Block Recording', () => {
    test('No Events Recorded if No Dev Block Signatures', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const dev_block = null
      const pull_qa_req = false

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(dev_block, GitHubMocks.Comment.no_signatures as IssueComment, recorder, pull_qa_req)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(0)
    })

    test('Record Dev Block Event Only', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const dev_block = true
      const pull_qa_req = false

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(dev_block, GitHubMocks.Comment.dev_blocked as IssueComment, recorder, pull_qa_req)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638345600,
        date: 1638385133,
        pull_request_id: pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'dev_blocked',
        actor: 'mcTestyFace',
        pull_request_event_index: 1
      }])
    })

    test('Record Dev Block Event and Non QA Ready Event', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const dev_block = true
      const pull_qa_req = true

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(dev_block, GitHubMocks.Comment.dev_blocked as IssueComment, recorder, pull_qa_req)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(2)
      expect(records).toEqual([
        {
          start_date: 1638345600,
          date: 1638385133,
          pull_request_id: pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'dev_blocked',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        },
        {
          start_date: 1638345600,
          date: 1638385133,
          pull_request_id: pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'non_qa_ready',
          actor: 'dev block change',
          pull_request_event_index: 2
        }
      ])
    })

    test('Record Un Dev Block Event Only', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const dev_block = false
      const pull_qa_req = false

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(dev_block, GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder, pull_qa_req)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638345600,
        date: 1638385133,
        pull_request_id: pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'un_dev_blocked',
        actor: 'mcTestyFace',
        pull_request_event_index: 1
      }])
    })
    test('Record Un Dev Block Event and QA Ready Event', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const dev_block = false
      const pull_qa_req = true

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(dev_block, GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder, pull_qa_req)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(2)
      expect(records).toEqual([
        {
          start_date: 1638345600,
          date: 1638385133,
          pull_request_id: pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'un_dev_blocked',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        },
        {
          start_date: 1638345600,
          date: 1638385133,
          pull_request_id: pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_ready',
          actor: 'dev block change',
          pull_request_event_index: 2
        }
      ])
    })
  })

  describe('Validate Interaction Recording', () => {
    test('No Events Recorded if No Interaction Signature', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const interacted = false
      const previous_pull_interacted_state = false
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordInteraction(interacted, GitHubMocks.Comment.no_signatures as IssueComment, recorder, previous_pull_interacted_state)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(0)
    })

    test('Record First Interaction Event', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const interacted = true
      const previous_pull_interacted_state = false
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordInteraction(interacted, GitHubMocks.Comment.interacted as IssueComment, recorder, previous_pull_interacted_state)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638345600,
        date: 1638385133,
        pull_request_id: pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'first_interaction',
        actor: 'ardelato',
        pull_request_event_index: 1
      }])
    })

    test('Record Interacted Event', () => {
      const recorder = new PullHistoryRecorder(pull.getID(), commit)
      const interacted = true
      const previous_pull_interacted_state = true
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordInteraction(interacted, GitHubMocks.Comment.interacted as IssueComment, recorder, previous_pull_interacted_state)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638345600,
        date: 1638385133,
        pull_request_id: pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'interacted',
        actor: 'ardelato',
        pull_request_event_index: 1
      }])
    })
  })

  describe('Validate Comment Parsing Updates Pull States', () => {
    test('No Signatures', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = false
      const pull_interacted_state = false

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.no_signatures as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(false)
      expect(updated_interacted_state).toBe(false)
    })

    test('No Signatures with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = true
      const pull_interacted_state = true

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.no_signatures as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(true)
      expect(updated_interacted_state).toBe(true)
    })

    test('QAed Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = false
      const pull_interacted_state = false

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.qaed as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(false)
      expect(updated_interacted_state).toBe(false)
    })

    test('QAed Signature with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = true
      const pull_interacted_state = true

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.qaed as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(true)
      expect(updated_interacted_state).toBe(true)
    })

    test('Dev Blocked Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = false
      const pull_interacted_state = false

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.dev_blocked as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(true)
      expect(updated_interacted_state).toBe(false)
    })

    test('Dev Blocked Signature with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = true
      const pull_interacted_state = true

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.dev_blocked as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(true)
      expect(updated_interacted_state).toBe(true)
    })

    test('Un Dev Blocked Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = false
      const pull_interacted_state = false

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(false)
      expect(updated_interacted_state).toBe(false)
    })

    test('Un Dev Blocked Signature with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = true
      const pull_interacted_state = true

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(false)
      expect(updated_interacted_state).toBe(true)
    })
    test('Interacted Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = false
      const pull_interacted_state = false

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.interacted as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(false)
      expect(updated_interacted_state).toBe(true)
    })

    test('Interacted Signature with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = true
      const pull_interacted_state = true

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      const { updated_dev_block_state, updated_interacted_state } = handleCommentEvent(pull, GitHubMocks.Comment.interacted as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(updated_dev_block_state).toBe(true)
      expect(updated_interacted_state).toBe(true)
    })
  })

  describe('Validate PullRequestCommit Parsing', () => {
    const local_pull = new Pull(mock_pull_request)
    const recorder = new PullHistoryRecorder(local_pull.getID())
    const pull_request_event = { ...GitHubMocks.Commit.base }
    const pull_dev_block_state = false

    expect(local_pull.getCommits().length).toBe(0)
    expect(recorder.getPullRecords().length).toBe(0)


    handlePullRequestCommitEvent(local_pull, pull_request_event as any, recorder, pull_dev_block_state)

    test('Commit Added to Pull', () => {
      expect(local_pull.getCommits()).toEqual([new CommitDB(mock_commit)])
    })

    test('Commit Set for Recorder', () => {
      expect(recorder.getCurrentCommit()).toEqual(mock_commit)
    })

    test('Commit is QA Ready Record Event', () => {
      expect(recorder.getPullRecords().length).toBe(1)
      expect(recorder.getPullRecords()).toEqual([
        {
          start_date: 1644825600,
          date: 1644887820,
          pull_request_id: pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_ready',
          actor: 'CI',
          pull_request_event_index: 1
        }
      ])
    })
  })

  describe('Validate IssueComment Parsing', () => {

    test('Events have Reference to Prior Commit Event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_request_event = { ...GitHubMocks.Commit.base }
      const pull_dev_block_state = false
      const pull_interacted_state = false

      handlePullRequestCommitEvent(local_pull, pull_request_event as any, recorder, pull_dev_block_state)

      handleCommentEvent(pull, GitHubMocks.Comment.qaed as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(recorder.getPullRecords()).toEqual([
        {
          start_date: 1644825600,
          date: 1644887820,
          pull_request_id: pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_ready',
          actor: 'CI',
          pull_request_event_index: 1
        },
        {
          start_date: 1638345600,
          date: 1638385133,
          pull_request_id: pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_stamped',
          actor: 'mcTestyFace',
          pull_request_event_index: 2
        },
        {
          start_date: 1638345600,
          date: 1638385133,
          pull_request_id: pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'non_qa_ready',
          actor: 'mcTestyFace',
          pull_request_event_index: 3
        }
      ])
    })

    test('Events have Reference to a Ghost Commit event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_dev_block_state = false
      const pull_interacted_state = false

      handleIssueCommentEvent(pull, GitHubMocks.Comment.qaed as IssueComment, recorder, pull_dev_block_state, pull_interacted_state)

      expect(recorder.getPullRecords()).toEqual([
        {
          start_date: 1638345600,
          date: 1638385133,
          pull_request_id: pull.getID(),
          commit_event_id: GitHubMocks.Comment.qaed.id,
          commit_sha: 'unknown_starting_commit',
          event: 'qa_stamped',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        },
        {
          start_date: 1638345600,
          date: 1638385133,
          pull_request_id: pull.getID(),
          commit_event_id: GitHubMocks.Comment.qaed.id,
          commit_sha: 'unknown_starting_commit',
          event: 'non_qa_ready',
          actor: 'mcTestyFace',
          pull_request_event_index: 2
        }])
    })
  })
})