import Pull from '../db/db_pull'
import { Commit, PullRequest } from '@prisma/client'
import CommitDB from '../db/db_commit'

const mockPullRequestData: PullRequest =   {
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
}

const mockCommit: Commit =   {
  "commit_event_id": "PURC_lADOACywbc4zH04S2gAoOTNjYmI0Mzc1ZWVlZmNhNzBmODNlOTA5ZDZkMjA5NTlkZTRiNDljMQ",
  "sha": "93cbb4375eeefca70f83e909d6d20959de4b49c1",
  "qa_ready": true,
  "interacted": false,
  "dev_blocked": false,
  "qa_stamped": false,
  "ci_status": "SUCCESS",
  "committed_at": 1645218654,
  "pushed_at": 1645218685,
  "pull_request_id": "PR_kwDOACywbc4zH04S"
}

describe('Pull Class', () => {
    test('get unique ID', () => {
      const unique_id = Pull.getUniqueID(mockPullRequestData)
      const expectedUniqueID = `${mockPullRequestData.repo} #${mockPullRequestData.pull_number}`
      expect(unique_id).toBe(expectedUniqueID)
    })
    test('get GraphQL Values', () => {
      const graphql_values = Pull.getGraphQLValues(mockPullRequestData)
      const expectedGraphQLValues = [{ name: 'ifixit', owner: 'iFixit' }, mockPullRequestData.pull_number]
      expect(graphql_values).toMatchObject(expectedGraphQLValues)
    })

    test('Get ID', () => {
      const pull = new Pull(mockPullRequestData)
      expect(pull.getID()).toEqual(mockPullRequestData.pull_request_id)
    })
    test('Get Author', () => {
      const pull = new Pull(mockPullRequestData)
      expect(pull.getAuthor()).toEqual(mockPullRequestData.author)
    })
    test('Get Commits on null commits constructor', () => {
      const pull = new Pull(mockPullRequestData)
      const expected: CommitDB[] = []
      expect(pull.getCommits()).toEqual(expected)
    })

    test('Get Commits on passed commits constructor', () => {
      const commits: CommitDB[] = [new CommitDB(mockCommit),new CommitDB()]
      const pull = new Pull(mockPullRequestData,commits)
      expect(pull.getCommits()).toEqual(commits)
    })

    test('Get Number of Commits', () => {

      const commits: CommitDB[] = [new CommitDB(mockCommit),new CommitDB()]
      const pull = new Pull(mockPullRequestData,commits)
      expect(pull.getNumberOfCommits()).toBe(2)
    })
    test('Get Head Commit Sha', () => {
      const pull = new Pull(mockPullRequestData)
      expect(pull.getHeadCommitSha()).toEqual(mockPullRequestData.head_ref)
    })
    test('Get Head Commit', () => {
      const commits: CommitDB[] = [new CommitDB(mockCommit),new CommitDB()]
      const pull = new Pull(mockPullRequestData,commits,commits[0])
      expect(pull.getHeadCommit()).toEqual(commits[0])
      expect(pull.getHeadCommit()).not.toEqual(commits[1])
    })
    test('Get Pull Request', () => {
      const pull = new Pull(mockPullRequestData)
      expect(pull.getPullRequest()).toEqual(mockPullRequestData)
    })
    test('Append Commit', () => {
      const pull = new Pull(mockPullRequestData)
      expect(pull.getNumberOfCommits()).toBe(0)

      pull.appendCommit(new CommitDB(mockCommit))

      expect(pull.getNumberOfCommits()).toBe(1)
      expect(pull.getCommits()).toEqual([new CommitDB(mockCommit)])
    })
    test('QA Required', () => {
      const pull = new Pull(mockPullRequestData)
      expect(pull.isQARequired()).toEqual(true)

      const no_qa_req_pull = new Pull({ ...mockPullRequestData, qa_req: 0 })
      expect(no_qa_req_pull.isQARequired()).toEqual(false)
    })
    test('Set Pull Request', () => {
      const newMockPullRequest: PullRequest =  {
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
      const pull = new Pull(mockPullRequestData)
      expect(pull.getPullRequest()).toEqual(mockPullRequestData)
      pull.setPullRequest(newMockPullRequest)
      expect(pull.getPullRequest()).not.toEqual(mockPullRequestData)
      expect(pull.getPullRequest()).toEqual(newMockPullRequest)
    })
})
