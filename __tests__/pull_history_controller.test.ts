import { IssueComment, PullRequestReview } from "@octokit/graphql-schema"
import { checkAndRecordDevBlockSignature, checkAndRecordInteraction, checkAndRecordQAedSignature, handleCommentEvent, handleIssueCommentEvent, handlePullRequestCommitEvent, handlePullRequestReviewEvent } from "../controllers/pull_history_controller"
import CommitDB from "../db/db_commit"
import Pull from "../db/db_pull"
import PullHistoryRecorder from "../db/db_pull_history"
import { GitHubMocks, mock_commit, mock_pull_request } from "./fixtures"

const commit = new CommitDB(mock_commit)

describe('Validate Parsing Pull Timeline Items', () => {
  describe('Validate QAed Recording', () => {
    test('No Events Recorded if No QAed Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordQAedSignature(GitHubMocks.Comment.no_signatures as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(0)
    })

    test('Record QAed Event and Non QA Ready', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setQAReadyState(true)
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordQAedSignature(GitHubMocks.Comment.qaed as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(2)
      expect(records).toEqual([{
        start_date: 1638316800,
        date: 1638385133,
        pull_request_id: local_pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'qa_stamped',
        actor: 'mcTestyFace',
        pull_request_event_index: 1
      },
      {
        start_date: 1638316800,
        date: 1638385133,
        pull_request_id: local_pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'non_qa_ready',
        actor: 'QAed',
        pull_request_event_index: 2
      }])
    })

    test('Record QAed Event but no Non QA Ready if Not QA Ready Already', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      local_pull.setQAReadyState(false)
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordQAedSignature(GitHubMocks.Comment.qaed as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()

      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638316800,
        date: 1638385133,
        pull_request_id: local_pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'qa_stamped',
        actor: 'mcTestyFace',
        pull_request_event_index: 1
      }])
    })
  })
  describe('Validate Dev Block Recording', () => {

    test('No Events Recorded if No Dev Block Signatures', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      local_pull.setQARequired(0);

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(GitHubMocks.Comment.no_signatures as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(0)
    })

    test('Record Dev Block Event Only', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      local_pull.setQARequired(0);

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(GitHubMocks.Comment.dev_blocked as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638316800,
        date: 1638385133,
        pull_request_id: local_pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'dev_blocked',
        actor: 'mcTestyFace',
        pull_request_event_index: 1
      }])
    })

    test('Record Dev Block Event and Non QA Ready Event if QA Ready', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      local_pull.setQAReadyState(true)
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(GitHubMocks.Comment.dev_blocked as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(2)
      expect(records).toEqual([
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'dev_blocked',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'non_qa_ready',
          actor: 'dev block change',
          pull_request_event_index: 2
        }
      ])
    })
    test('Record Dev Block Event but No Non QA Ready Event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(GitHubMocks.Comment.dev_blocked as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'dev_blocked',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        }
      ])
    })

    test('Record Un Dev Block Event Only', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      local_pull.setQARequired(0);

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638316800,
        date: 1638385133,
        pull_request_id: local_pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'un_dev_blocked',
        actor: 'mcTestyFace',
        pull_request_event_index: 1
      }])
    })

    test('Record Un Dev Block Event and QA Ready Event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(2)
      expect(records).toEqual([
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'un_dev_blocked',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_ready',
          actor: 'dev block change',
          pull_request_event_index: 2
        }
      ])
    })

    test('Record Un Dev Block Event but No QA Ready Event if QAed', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      local_pull.setQAStampedState(true)

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordDevBlockSignature(GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'un_dev_blocked',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        }
      ])
    })
  })

  describe('Validate Interaction Recording', () => {
    test('No Events Recorded if No Interaction Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordInteraction(GitHubMocks.Comment.no_signatures as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(0)
    })

    test('Record First Interaction Event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordInteraction(GitHubMocks.Comment.interacted as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638316800,
        date: 1638385133,
        pull_request_id: local_pull.getID(),
        commit_event_id: commit.getID(),
        commit_sha: commit.getSha(),
        event: 'first_interaction',
        actor: 'ardelato',
        pull_request_event_index: 1
      }])
    })

    test('Record Interacted Event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      local_pull.setInteractedState(true)
      expect(recorder.getPullRecords().length).toBe(0)

      checkAndRecordInteraction(GitHubMocks.Comment.interacted as IssueComment, recorder, local_pull)

      const records = recorder.getPullRecords()
      expect(records.length).toBe(1)
      expect(records).toEqual([{
        start_date: 1638316800,
        date: 1638385133,
        pull_request_id: local_pull.getID(),
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
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

     handleCommentEvent(local_pull, GitHubMocks.Comment.no_signatures as IssueComment, recorder)

      expect(local_pull.isDevBlocked()).toBe(false)
      expect(local_pull.wasInteractedWith()).toBe(false)
    })

    test('No Signatures with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setDevBlockedState(true)
      local_pull.setInteractedState(true)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.no_signatures as IssueComment, recorder)

      expect(local_pull.isDevBlocked()).toBe(true)
      expect(local_pull.wasInteractedWith()).toBe(true)
    })

    test('QAed Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setQAReadyState(true)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.qaed as IssueComment, recorder)

      expect(local_pull.isQAReady()).toBe(false)
      expect(local_pull.isQAed()).toBe(true)
      expect(local_pull.isDevBlocked()).toBe(false)
      expect(local_pull.wasInteractedWith()).toBe(false)
    })

    test('QAed Signature with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setDevBlockedState(true)
      local_pull.setInteractedState(true)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.qaed as IssueComment, recorder)

      expect(local_pull.isQAReady()).toBe(false)
      expect(local_pull.isQAed()).toBe(true)
      expect(local_pull.isDevBlocked()).toBe(true)
      expect(local_pull.wasInteractedWith()).toBe(true)
    })

    test('Dev Blocked Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setQAReadyState(true)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.dev_blocked as IssueComment, recorder)

      expect(local_pull.isQAReady()).toBe(false)
      expect(local_pull.isQAed()).toBe(false)
      expect(local_pull.isDevBlocked()).toBe(true)
      expect(local_pull.wasInteractedWith()).toBe(false)
    })

    test('Dev Blocked Signature with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setDevBlockedState(true)
      local_pull.setInteractedState(true)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.dev_blocked as IssueComment, recorder)

      expect(local_pull.isQAReady()).toBe(false)
      expect(local_pull.isQAed()).toBe(false)
      expect(local_pull.isDevBlocked()).toBe(true)
      expect(local_pull.wasInteractedWith()).toBe(true)
    })

    test('Un Dev Blocked Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setDevBlockedState(true)
      local_pull.setInteractedState(true)


      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder)

      expect(local_pull.isQAReady()).toBe(true)
      expect(local_pull.isQAed()).toBe(false)
      expect(local_pull.isDevBlocked()).toBe(false)
      expect(local_pull.wasInteractedWith()).toBe(true)
    })

    test('Un Dev Blocked Signature with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setQAStampedState(true)
      local_pull.setDevBlockedState(true)
      local_pull.setInteractedState(true)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.un_dev_blocked as IssueComment, recorder)

      expect(local_pull.isQAReady()).toBe(false)
      expect(local_pull.isQAed()).toBe(true)
      expect(local_pull.isDevBlocked()).toBe(false)
      expect(local_pull.wasInteractedWith()).toBe(true)
    })
    test('Interacted Signature', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.interacted as IssueComment, recorder)

      expect(local_pull.wasInteractedWith()).toBe(true)
    })

    test('Interacted Signature with Previous True States', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setInteractedState(true)

      expect(local_pull.getCommits().length).toBe(0)
      expect(recorder.getPullRecords().length).toBe(0)

      handleCommentEvent(local_pull, GitHubMocks.Comment.interacted as IssueComment, recorder)

      expect(local_pull.wasInteractedWith()).toBe(true)
    })
  })

  describe('Validate PullRequestCommit Parsing', () => {
    const local_pull = new Pull(mock_pull_request)
    const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
    const pull_request_event = { ...GitHubMocks.Commit.base }

    expect(local_pull.getCommits().length).toBe(0)
    expect(recorder.getPullRecords().length).toBe(0)


    handlePullRequestCommitEvent(local_pull, pull_request_event as any, recorder)

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
          start_date: 1644883200,
          date: 1644887820,
          pull_request_id: local_pull.getID(),
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
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      const pull_request_event = { ...GitHubMocks.Commit.base }

      handlePullRequestCommitEvent(local_pull, pull_request_event as any, recorder)

      handleCommentEvent(local_pull, GitHubMocks.Comment.qaed as IssueComment, recorder)

      expect(recorder.getPullRecords()).toEqual([
        {
          start_date: 1644883200,
          date: 1644887820,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_ready',
          actor: 'CI',
          pull_request_event_index: 1
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_stamped',
          actor: 'mcTestyFace',
          pull_request_event_index: 2
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'non_qa_ready',
          actor: 'QAed',
          pull_request_event_index: 3
        }
      ])
    })

    test('Events have Reference to a Ghost Commit event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setQAReadyState(true)

      handleIssueCommentEvent(local_pull, GitHubMocks.Comment.qaed as IssueComment, recorder)

      expect(recorder.getPullRecords()).toEqual([
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: GitHubMocks.Comment.qaed.id,
          commit_sha: 'unknown_starting_commit',
          event: 'qa_stamped',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: GitHubMocks.Comment.qaed.id,
          commit_sha: 'unknown_starting_commit',
          event: 'non_qa_ready',
          actor: 'QAed',
          pull_request_event_index: 2
        }])
    })
  })

  describe('Validate PullRequestReview Parsing', () => {

    test('Events have Reference to Prior Commit Event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      const pull_request_event = { ...GitHubMocks.Commit.base }

      handlePullRequestCommitEvent(local_pull, pull_request_event as any, recorder)

      handleCommentEvent(local_pull, GitHubMocks.Comment.qaed as PullRequestReview, recorder)

      expect(recorder.getPullRecords()).toEqual([
        {
          start_date: 1644883200,
          date: 1644887820,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_ready',
          actor: 'CI',
          pull_request_event_index: 1
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_stamped',
          actor: 'mcTestyFace',
          pull_request_event_index: 2
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'non_qa_ready',
          actor: 'QAed',
          pull_request_event_index: 3
        }
      ])
    })

    test('Events have Reference to a Ghost Commit event', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID(), commit)
      local_pull.setQAReadyState(true)

      handlePullRequestReviewEvent(local_pull, GitHubMocks.Review.qaed as PullRequestReview, recorder)

      expect(recorder.getPullRecords()).toEqual([
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: GitHubMocks.Comment.qaed.id,
          commit_sha: 'unknown_starting_commit',
          event: 'qa_stamped',
          actor: 'mcTestyFace',
          pull_request_event_index: 1
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: GitHubMocks.Comment.qaed.id,
          commit_sha: 'unknown_starting_commit',
          event: 'non_qa_ready',
          actor: 'QAed',
          pull_request_event_index: 2
        }])
    })


    test('Parsing of multiple comments', () => {
      const local_pull = new Pull(mock_pull_request)
      const recorder = new PullHistoryRecorder(local_pull.getID())
      const pull_request_event = { ...GitHubMocks.Commit.base }

      handlePullRequestCommitEvent(local_pull, pull_request_event as any, recorder)

      handlePullRequestReviewEvent(local_pull, GitHubMocks.Review.qaed_dev_blocked as PullRequestReview, recorder)

      expect(recorder.getPullRecords()).toEqual([
        {
          start_date: 1644883200,
          date: 1644887820,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_ready',
          actor: 'CI',
          pull_request_event_index: 1
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'qa_stamped',
          actor: 'mcTestyFace',
          pull_request_event_index: 2
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'non_qa_ready',
          actor: 'QAed',
          pull_request_event_index: 3
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'dev_blocked',
          actor: 'mcTestyFace',
          pull_request_event_index: 4
        },
        {
          start_date: 1638316800,
          date: 1638385133,
          pull_request_id: local_pull.getID(),
          commit_event_id: commit.getID(),
          commit_sha: commit.getSha(),
          event: 'un_dev_blocked',
          actor: 'mcTestyFace',
          pull_request_event_index: 5
        }
      ])
    })
  })
})