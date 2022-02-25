import Pull from "../db/db_pull"
import { isCommitQAReady, parseCommit } from "../controllers/commit_controller"

const pull = new Pull({
    "repo": "iFixit/ifixit",
    "pull_number": 41917,
    "state": "OPEN",
    "title": "Add Feature Switch to Role Out Select Manage Section Permissions.",
    "head_ref": "93cbb4375eeefca70f83e909d6d20959de4b49c1",
    "qa_req": 1,
    "created_at": 1645218079,
    "updated_at": 1645575990,
    "closed_at": null,
    "merged_at": null,
    "closes": null,
    "interacted": false,
    "qa_ready": true,
    "pull_request_id": "PR_kwDOACywbc4zH04S",
    "author": "danielcliu",
    "dev_blocked": false,
    "qa_stamped": false,
    "agg_dev_block_count": 0,
    "agg_interacted_count": 0,
    "agg_qa_ready_count": 1,
    "agg_qa_stamped_count": 0,
    "head_commit_id": "PURC_lADOACywbc4zH04S2gAoOTNjYmI0Mzc1ZWVlZmNhNzBmODNlOTA5ZDZkMjA5NTlkZTRiNDljMQ"
})

describe('Commit Controller', () => {

  describe('Parsing Commit Data', () => {
    test('Parse default', () => {
      const mock_commit_data = {
        id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
        pr_commit: {
          oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
          committedDate: '2021-11-11T05:35:08Z',
          pushedDate: '2021-11-11T05:35:08Z',
          status: {
            state: 'SUCCESS'
          }
      }
  }
      const commit = parseCommit(pull, mock_commit_data)
      expect(commit.getCommit()).toEqual({
        commit_event_id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
        sha: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
        ci_status: 'SUCCESS',
        committed_at: 1636608908,
        pull_request_id: 'PR_kwDOACywbc4zH04S',
        pushed_at: 1636608908,
        qa_ready: false,
        interacted: false,
        dev_blocked: false,
        qa_stamped: false})
    })

    test('Parse for null CI State', () => {
      const mock_commit_data = {
        id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
        pr_commit: {
          oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
          committedDate: '2021-11-11T05:35:08Z',
          pushedDate: '2021-11-11T05:35:08Z',
          status: null
        }
      }

      const commit = parseCommit(pull,mock_commit_data)
      expect(commit.getCommit()).toEqual({
        commit_event_id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
        sha: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
        ci_status: null,
        committed_at: 1636608908,
        pull_request_id: 'PR_kwDOACywbc4zH04S',
        pushed_at: 1636608908,
        qa_ready: false,
        interacted: false,
        dev_blocked: false,
        qa_stamped: false})
    })

    test('Parse for null pushed date', () => {
      const mock_commit_data = {
        id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
        pr_commit: {
          oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
          committedDate: '2021-11-11T05:35:08Z',
          pushedDate: null,
          status: null
        }
      }

      const commit = parseCommit(pull,mock_commit_data)
      expect(commit.getCommit()).toEqual({
        commit_event_id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
        sha: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
        ci_status: null,
        committed_at: 1636608908,
        pull_request_id: 'PR_kwDOACywbc4zH04S',
        pushed_at: null,
        qa_ready: false,
        interacted: false,
        dev_blocked: false,
        qa_stamped: false})
    })
  })

  describe('Check Commit QA Ready', () => {
    test('Dev Block Status', () => {
    const mock_commit_data = {
        id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
      pr_commit: {
        oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
        committedDate: '2021-11-11T05:35:08Z',
        pushedDate: '2021-11-11T05:35:08Z',
        status: {
          state: 'SUCCESS'
        }
      }
      }

      const commit = parseCommit(pull, mock_commit_data)
      let dev_blocked = true
      const pull_qa_req = true
      expect(isCommitQAReady(dev_blocked, commit.getCommit(), pull_qa_req)).toBe(false)

      dev_blocked = false
      expect(isCommitQAReady(dev_blocked, commit.getCommit(), pull_qa_req)).toBe(true)
    })

    describe('CI Status', () => {
      test('With CI Status Good', () => {
        let mock_commit_data_with_ci = {
          id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',pr_commit: {
            oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
            committedDate: '2021-11-11T05:35:08Z',
            pushedDate: '2021-11-11T05:35:08Z',
            status: {
              state: 'SUCCESS'
            }
          }
        }

        let commit = parseCommit(pull, mock_commit_data_with_ci)
        const dev_blocked = false
        const pull_qa_req = true
        expect(isCommitQAReady(dev_blocked, commit.getCommit(), pull_qa_req)).toBe(true)
        mock_commit_data_with_ci = {
            id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',pr_commit: {
              oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
              committedDate: '2021-11-11T05:35:08Z',
              pushedDate: '2021-11-11T05:35:08Z',
              status: {
                state: 'EXPECTED'
              }
            }
        }
          commit = parseCommit(pull, mock_commit_data_with_ci)
          expect(isCommitQAReady(dev_blocked, commit.getCommit(), pull_qa_req)).toBe(true)
      })

      test('With No CI Status', () => {
        const mock_commit_data_no_ci = {
          id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
          pr_commit: {
            oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
            committedDate: '2021-11-11T05:35:08Z',
            pushedDate: '2021-11-11T05:35:08Z',
            status: null
          }
        }
        const dev_blocked = false
        const pull_qa_req = true
        const commit_no_ci = parseCommit(pull,mock_commit_data_no_ci)
        expect(isCommitQAReady(dev_blocked, commit_no_ci.getCommit(), pull_qa_req)).toBe(true)
      })

      test('With Bad CI Status', () => {
        const mock_commit_data_no_ci = {
          id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
          pr_commit: {
            oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
            committedDate: '2021-11-11T05:35:08Z',
            pushedDate: '2021-11-11T05:35:08Z',
            status: {
              state: 'FAILURE'
            }
          }
        }
        const dev_blocked = false
        const pull_qa_req = true
        const commit_no_ci = parseCommit(pull,mock_commit_data_no_ci)
        expect(isCommitQAReady(dev_blocked, commit_no_ci.getCommit(), pull_qa_req)).toBe(false)
      })
    })

    test('Null Pushed Date', () => {
      const mock_commit_data = {
        id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',
        pr_commit: {
          oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
          committedDate: '2021-11-11T05:35:08Z',
          pushedDate: null,
          status: null
        }
      }
      const dev_blocked = false
      const pull_qa_req = true
      const commit_no_ci = parseCommit(pull,mock_commit_data)
      expect(isCommitQAReady(dev_blocked, commit_no_ci.getCommit(), pull_qa_req)).toBe(false)
    })

    test('No QA Required', () => {
      const mock_commit_data = {
        id: 'PURC_lADOAldSuM4vJPyg2gAoMzRjNmJmN2YyZjRhYjdiYzRlOTRkODhmYzUxZTgyOThmNDI0MTE2OA',pr_commit: {
          oid: '34c6bf7f2f4ab7bc4e94d88fc51e8298f4241168',
          committedDate: '2021-11-11T05:35:08Z',
          pushedDate: '2021-11-11T05:35:08Z',
          status: {
            state: 'SUCCESS'
          }
        }
      }
      const dev_blocked = false
      const pull_qa_req = false
      const commit_no_ci = parseCommit(pull,mock_commit_data)
      expect(isCommitQAReady(dev_blocked, commit_no_ci.getCommit(), pull_qa_req)).toBe(false)
    })
  })
})