import { PullRequest } from "@prisma/client"
import prisma from "../prisma/client"
import { utils } from '../scripts/utils'
import { parsePull, grabValues, closesDeclared, qaRequired} from '../controllers/pull_controller'
import { PullRequest as GitHubPullRequest } from "@octokit/graphql-schema"
import { extended_mock_github_data, mock_github_data, mock_pull_request } from "./fixtures"



describe('Parsing Pull Data', () => {
  test('Dates properly updated', () => {
    const pull_request = grabValues(mock_github_data as GitHubPullRequest)

    expect(pull_request.closed_at).toBe(null);
    expect(pull_request.created_at).toBe(1644361367);
    expect(pull_request.updated_at).toBe(1645642245);
    expect(pull_request.merged_at).toBe(null);
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
    const pull = parsePull(extended_mock_github_data as GitHubPullRequest);
    expect(pull.getPullRequest()).toEqual(mock_pull_request)
  })
});
