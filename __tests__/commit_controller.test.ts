import Pull from "../db/db_pull"
import { isCommitQAReady, parseCommit } from "../controllers/commit_controller"
import { mock_pull_request, mock_github_commit, mock_commit_data, mock_github_commit_no_ci, mock_github_commit_no_pushed_date, mock_github_commit_bad_ci} from "./fixtures"

const pull = new Pull(mock_pull_request)

describe('Commit Controller', () => {

  describe('Parsing Commit Data', () => {
    test('Parse default', () => {
      const commit = parseCommit(pull, mock_github_commit)
      expect(commit.getCommit()).toEqual(mock_commit_data)
    })

    test('Parse for null CI State', () => {
      const commit = parseCommit(pull,mock_github_commit_no_ci)
      expect(commit.getCommit()).toEqual({
        ...mock_commit_data,
        ci_status: null
      })
    })

    test('Parse for null pushed date', () => {
      const commit = parseCommit(pull,mock_github_commit_no_pushed_date)
      expect(commit.getCommit()).toEqual({
        ...mock_commit_data,
        pushed_at: null
      })
    })
  })

  describe('Check Commit QA Ready', () => {
    test('Dev Block Status', () => {
      const commit = parseCommit(pull, mock_github_commit)
      let dev_blocked = true
      const pull_qa_req = true
      expect(isCommitQAReady(dev_blocked, commit.getCommit(), pull_qa_req)).toBe(false)

      dev_blocked = false
      expect(isCommitQAReady(dev_blocked, commit.getCommit(), pull_qa_req)).toBe(true)
    })

    describe('CI Status', () => {
      test('With CI Status Good', () => {
        const commit = parseCommit(pull, mock_github_commit)
        const dev_blocked = false
        const pull_qa_req = true
        expect(isCommitQAReady(dev_blocked, commit.getCommit(), pull_qa_req)).toBe(true)
      })

      test('With No CI Status', () => {
        const dev_blocked = false
        const pull_qa_req = true
        const commit_no_ci = parseCommit(pull,mock_github_commit_no_ci)
        expect(isCommitQAReady(dev_blocked, commit_no_ci.getCommit(), pull_qa_req)).toBe(true)
      })

      test('With Bad CI Status', () => {
        const dev_blocked = false
        const pull_qa_req = true
        const commit_bad_ci = parseCommit(pull,mock_github_commit_bad_ci)
        expect(isCommitQAReady(dev_blocked, commit_bad_ci.getCommit(), pull_qa_req)).toBe(false)
      })
    })

    test('Null Pushed Date', () => {
      const dev_blocked = false
      const pull_qa_req = true
      const commit_no_ci = parseCommit(pull,mock_github_commit_no_pushed_date)
      expect(isCommitQAReady(dev_blocked, commit_no_ci.getCommit(), pull_qa_req)).toBe(false)
    })

    test('No QA Required', () => {
      const dev_blocked = false
      const pull_qa_req = false
      const commit_no_ci = parseCommit(pull,mock_github_commit)
      expect(isCommitQAReady(dev_blocked, commit_no_ci.getCommit(), pull_qa_req)).toBe(false)
    })
  })
})