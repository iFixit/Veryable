import { PullRequest } from "@prisma/client"
import prisma from "../prisma/client"
import { utils } from '../scripts/utils'
import { parsePull } from '../controllers/pull_controller'
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
      const pull = parsePull(mock_github_data as GitHubPullRequest)
      const pull_request = pull.getPullRequest()

      expect(pull_request.closed_at).toBe(null);
      expect(pull_request.created_at).toBe(1628362800);
      expect(pull_request.updated_at).toBe(1628362800);
      expect(pull_request.merged_at).toBe(1628362800);
    });

    test('Default QA Req', async () => {
      const qa_req_mock_github_data: RecursivePartial<GitHubPullRequest> = {...mock_github_data, bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065',}

      const pull = parsePull(qa_req_mock_github_data as GitHubPullRequest);
      expect(pull.isQARequired()).toBe(true)
    });

    test('Parse for QA Req', async () => {
       const qa_req_mock_github_data: RecursivePartial<GitHubPullRequest> = {...mock_github_data, bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065 qa_req 2',}

      const pull = parsePull(qa_req_mock_github_data as GitHubPullRequest);
      expect(pull.isQARequired()).toBe(true)
    });

    test('Parse for No QA Req', async () => {
      const qa_req_mock_github_data: RecursivePartial<GitHubPullRequest> = {...mock_github_data, bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065 qa_req 0',}

      const pull = parsePull(qa_req_mock_github_data as GitHubPullRequest);
      expect(pull.isQARequired()).toBe(false)
    });

    test('Closes Declared', async () => {
      const closes_mock_github_data: RecursivePartial<GitHubPullRequest> = {...mock_github_data, bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065',}

      const pull = parsePull(closes_mock_github_data as GitHubPullRequest);
      expect(pull.getPullRequest().closes).toBe(39065)
    });

     test('Closes Not Declared', async () => {
      const pull = parsePull(mock_github_data as GitHubPullRequest);
      expect(pull.getPullRequest().closes).toEqual(null)
     });

    test('Parse Base Repository', async () => {
      const base_repo_mock_github_data: RecursivePartial<GitHubPullRequest> = {...mock_github_data,  baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
      };

      const pull = parsePull(base_repo_mock_github_data as GitHubPullRequest);
      expect(pull.getPullRequest().repo).toEqual('iFixit/ifixit')
    });

    test('Parse Null Base Repository', async () => {
      const pull = parsePull(mock_github_data as GitHubPullRequest);
      expect(pull.getPullRequest().repo).toEqual('unknown')
    });

     test('Parse Head Commit ID', async () => {
      const head_commit_id_mock_github_data: RecursivePartial<GitHubPullRequest> = {...mock_github_data,
        headRef: {
          id: 'MDM6UmVmMjkyODc0OTpyZWZzL2hlYWRzL2FwaS1kb2NzLS1maXgtc2lkZWJhcg=='
        }
      };

      const pull = parsePull(head_commit_id_mock_github_data as GitHubPullRequest);
      expect(pull.getPullRequest().head_commit_id).toEqual('MDM6UmVmMjkyODc0OTpyZWZzL2hlYWRzL2FwaS1kb2NzLS1maXgtc2lkZWJhcg==')
     });

     test('Parse Null Head Commit ID', async () => {
      const pull = parsePull(mock_github_data as GitHubPullRequest);
      expect(pull.getPullRequest().head_commit_id).toEqual('unknown')
     });

    test('Parse Author', async () => {
        const author_mock_github_data: RecursivePartial<GitHubPullRequest> = {...mock_github_data,
          author: {
            login: 'mcTestyFace'
          }
        };

        const pull = parsePull(author_mock_github_data as GitHubPullRequest);
        expect(pull.getAuthor()).toEqual('mcTestyFace')
    });

    test('Parse Null Author', async () => {
        const pull = parsePull(mock_github_data as GitHubPullRequest);
        expect(pull.getAuthor()).toEqual('unknown')
      });
  });
