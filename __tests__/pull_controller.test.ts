import { PullRequest } from "@prisma/client"
import prisma from "../prisma/client"
import { utils } from '../scripts/utils'
import { parsePull, grabValues, closesDeclared, qaRequired} from '../controllers/pull_controller'
import { PullRequest as GitHubPullRequest } from "@octokit/graphql-schema"

const mock_github_data: RecursivePartial<GitHubPullRequest> = {
  closedAt: null,
  createdAt: '2021-08-07T19:00:00Z',
  headRefOid: '1a76cf540ec175ba6874cc3b4915955c40dab2da',
  mergedAt: '2021-08-07T19:00:00Z',
  number: 39126,
  state: 'MERGED',
  title: 'Shopify Hotfix: Add order method to get customer email and use it in return emails',
  updatedAt: '2021-08-07T19:00:00Z',
  id: '28ddd8f5-b8b8-474c-864d-5373f1442873'
};

describe('Parsing Pull Data', () => {
  test('Dates properly updated', () => {
    const pull_request = grabValues(mock_github_data as GitHubPullRequest)

    expect(pull_request.closed_at).toBe(null);
    expect(pull_request.created_at).toBe(1628362800);
    expect(pull_request.updated_at).toBe(1628362800);
    expect(pull_request.merged_at).toBe(1628362800);
  });

  test('Default QA Req', async () => {
    const qa_req_mock_github_data: RecursivePartial<GitHubPullRequest> = { ...mock_github_data, bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065', }

    expect(qaRequired(qa_req_mock_github_data as GitHubPullRequest)).toBe(1)
  });

  test('Parse for QA Req', async () => {
    const qa_req_mock_github_data: RecursivePartial<GitHubPullRequest> = { ...mock_github_data, bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065 qa_req 2', }

    expect(qaRequired(qa_req_mock_github_data as GitHubPullRequest)).toBe(2)
  });

  test('Parse for No QA Req', async () => {
    const qa_req_mock_github_data: RecursivePartial<GitHubPullRequest> = { ...mock_github_data, bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065 qa_req 0', }

    expect(qaRequired(qa_req_mock_github_data as GitHubPullRequest)).toBe(0)
  });

  test('Closes Declared', async () => {
    const closes_mock_github_data: RecursivePartial<GitHubPullRequest> = { ...mock_github_data, bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065', }

    expect(closesDeclared(closes_mock_github_data as GitHubPullRequest)).toBe(39065)
  });

  test('Closes Not Declared', async () => {
    expect(closesDeclared(mock_github_data as GitHubPullRequest)).toBe(null)
  });

  test('Parse Base Repository', async () => {
    const base_repo_mock_github_data: RecursivePartial<GitHubPullRequest> = {
      ...mock_github_data, baseRepository: {
        nameWithOwner: 'iFixit/ifixit',
      },
    };

    const pull_request = grabValues(base_repo_mock_github_data as GitHubPullRequest)
    expect(pull_request.repo).toEqual('iFixit/ifixit')
  });

  test('Parse Null Base Repository', async () => {
    const pull_request = grabValues(mock_github_data as GitHubPullRequest)
    expect(pull_request.repo).toEqual('unknown')
  });

  test('Parse Head Commit ID', async () => {
    const head_commit_id_mock_github_data: RecursivePartial<GitHubPullRequest> = {
      ...mock_github_data,
      headRef: {
        id: 'MDM6UmVmMjkyODc0OTpyZWZzL2hlYWRzL2FwaS1kb2NzLS1maXgtc2lkZWJhcg=='
      }
    };
    const pull_request = grabValues(head_commit_id_mock_github_data as GitHubPullRequest)

    expect(pull_request.head_commit_id).toEqual('MDM6UmVmMjkyODc0OTpyZWZzL2hlYWRzL2FwaS1kb2NzLS1maXgtc2lkZWJhcg==')
  });

  test('Parse Null Head Commit ID', async () => {
    const pull_request = grabValues(mock_github_data as GitHubPullRequest);
    expect(pull_request.head_commit_id).toEqual('unknown')
  });

  test('Parse Author', async () => {
    const author_mock_github_data: RecursivePartial<GitHubPullRequest> = {
      ...mock_github_data,
      author: {
        login: 'mcTestyFace'
      }
    };

    const pull_request = grabValues(author_mock_github_data as GitHubPullRequest);
    expect(pull_request.author).toEqual('mcTestyFace')
  });

  test('Parse Null Author', async () => {
    const pull_request = grabValues(mock_github_data as GitHubPullRequest);
    expect(pull_request.author).toEqual('unknown')
  });

  test('Create Parsed Pull Model', () => {
    const extended_mock_github_data = {
        id: 'PR_kwDOAldSuM4zIXnQ',
        title: 'build(deps): bump browserslist from 4.16.0 to 4.19.2',
        number: 235,
        bodyText: 'Bumps browserslist from 4.16.0 to 4.19.2.',
        state: 'OPEN',
        author: { login: 'dependabot' },
        baseRepository: { nameWithOwner: 'iFixit/pulldasher' },
        headRef: {
        id: 'MDM6UmVmMzkyNzcyNDA6cmVmcy9oZWFkcy9kZXBlbmRhYm90L25wbV9hbmRfeWFybi9icm93c2Vyc2xpc3QtNC4xOS4y'
      },
      headRefOid: '42e7f57167068b84825cd2bb1c0df0f4a5f3da3f',
      createdAt: '2022-02-18T23:18:22Z',
      closedAt: null,
      updatedAt: '2022-02-21T19:34:13Z',
      mergedAt: null,
    }
    const pull = parsePull(extended_mock_github_data as GitHubPullRequest);
    expect(pull.getPullRequest()).toEqual({
        "repo": "iFixit/pulldasher",
        "pull_number": 235,
        "state": "OPEN",
        "title": "build(deps): bump browserslist from 4.16.0 to 4.19.2",
        "head_ref": "42e7f57167068b84825cd2bb1c0df0f4a5f3da3f",
        "qa_req": 1,
        "created_at": 1645226302,
        "updated_at": 1645472053,
        "closed_at": null,
        "merged_at": null,
        "closes": null,
        "interacted": false,
      "qa_ready": false,
        "pull_request_id": "PR_kwDOAldSuM4zIXnQ",
        "author": "dependabot",
        "dev_blocked": false,
        "qa_stamped": false,
        "agg_dev_block_count": 0,
        "agg_interacted_count": 0,
        "agg_qa_ready_count": 0,
        "agg_qa_stamped_count": 0,
        "head_commit_id": "MDM6UmVmMzkyNzcyNDA6cmVmcy9oZWFkcy9kZXBlbmRhYm90L25wbV9hbmRfeWFybi9icm93c2Vyc2xpc3QtNC4xOS4y"
    })
  })
});
