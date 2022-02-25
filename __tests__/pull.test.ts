import Pull from '../db/db_pull'
import { Commit, PullRequest } from '@prisma/client'
import CommitDB from '../db/db_commit'
import { mock_pull_request, mock_commit_data } from "./fixtures"


describe('Pull Class', () => {
    test('get unique ID', () => {
      const unique_id = Pull.getUniqueID(mock_pull_request)
      const expectedUniqueID = `${mock_pull_request.repo} #${mock_pull_request.pull_number}`
      expect(unique_id).toBe(expectedUniqueID)
    })
    test('get GraphQL Values', () => {
      const graphql_values = Pull.getGraphQLValues(mock_pull_request)
      const expectedGraphQLValues = [{ name: 'ifixit', owner: 'iFixit' }, mock_pull_request.pull_number]
      expect(graphql_values).toMatchObject(expectedGraphQLValues)
    })

    test('Get ID', () => {
      const pull = new Pull(mock_pull_request)
      expect(pull.getID()).toEqual(mock_pull_request.pull_request_id)
    })
    test('Get Author', () => {
      const pull = new Pull(mock_pull_request)
      expect(pull.getAuthor()).toEqual(mock_pull_request.author)
    })
    test('Get Commits on null commits constructor', () => {
      const pull = new Pull(mock_pull_request)
      const expected: CommitDB[] = []
      expect(pull.getCommits()).toEqual(expected)
    })

    test('Get Commits on passed commits constructor', () => {
      const commits: CommitDB[] = [new CommitDB(mock_commit_data),new CommitDB()]
      const pull = new Pull(mock_pull_request,commits)
      expect(pull.getCommits()).toEqual(commits)
    })

    test('Get Number of Commits', () => {

      const commits: CommitDB[] = [new CommitDB(mock_commit_data),new CommitDB()]
      const pull = new Pull(mock_pull_request,commits)
      expect(pull.getNumberOfCommits()).toBe(2)
    })
    test('Get Head Commit Sha', () => {
      const pull = new Pull(mock_pull_request)
      expect(pull.getHeadCommitSha()).toEqual(mock_pull_request.head_ref)
    })
    test('Get Head Commit', () => {
      const commits: CommitDB[] = [new CommitDB(mock_commit_data),new CommitDB()]
      const pull = new Pull(mock_pull_request,commits,commits[0])
      expect(pull.getHeadCommit()).toEqual(commits[0])
      expect(pull.getHeadCommit()).not.toEqual(commits[1])
    })
    test('Get Pull Request', () => {
      const pull = new Pull(mock_pull_request)
      expect(pull.getPullRequest()).toEqual(mock_pull_request)
    })
    test('Append Commit', () => {
      const pull = new Pull(mock_pull_request)
      expect(pull.getNumberOfCommits()).toBe(0)

      pull.appendCommit(new CommitDB(mock_commit_data))

      expect(pull.getNumberOfCommits()).toBe(1)
      expect(pull.getCommits()).toEqual([new CommitDB(mock_commit_data)])
    })
    test('QA Required', () => {
      const pull = new Pull(mock_pull_request)
      expect(pull.isQARequired()).toEqual(true)

      const no_qa_req_pull = new Pull({ ...mock_pull_request, qa_req: 0 })
      expect(no_qa_req_pull.isQARequired()).toEqual(false)
    })
    test('Set Pull Request', () => {
      const new_mock_pull_request: PullRequest =  {
        "repo": "iFixit/ifixit",
        "pull_number": 41744,
        "state": "OPEN",
        "title": "Sitemaps: Remove store links from lang subdomains",
        "head_ref": "1c3b8ec11632c13c2ed6e575c584383721026995",
        "qa_req": 1,
        "created_at": 1643931839,
        "updated_at": 1645119612,
        "closed_at": null,
        "merged_at": null,
        "closes": 41072,
        "interacted": true,
        "qa_ready": false,
        "pull_request_id": "PR_kwDOACywbc4yDlj3",
        "author": "jande141",
        "dev_blocked": false,
        "qa_stamped": false,
        "agg_dev_block_count": 3,
        "agg_interacted_count": 2,
        "agg_qa_ready_count": 4,
        "agg_qa_stamped_count": 2,
        "head_commit_id": "PURC_lADOACywbc4yDlj32gAoMWMzYjhlYzExNjMyYzEzYzJlZDZlNTc1YzU4NDM4MzcyMTAyNjk5NQ"
      }
      const pull = new Pull(mock_pull_request)
      expect(pull.getPullRequest()).toEqual(mock_pull_request)
      pull.setPullRequest(new_mock_pull_request)
      expect(pull.getPullRequest()).not.toEqual(mock_pull_request)
      expect(pull.getPullRequest()).toEqual(new_mock_pull_request)
    })
})
