import Pull from '../db/db_pull'
import { PullRequest } from '@prisma/client'

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

describe('PullRequest Class', () => {
  describe('Class Methods', () => {
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
  })
})
