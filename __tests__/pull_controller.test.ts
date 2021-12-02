import { Pull } from "@prisma/client"
import { utils } from '../scripts/utils'
import { parsePull } from '../controllers/pull_controller'
import { PullRequest as GitHubPullRequest } from "@octokit/graphql-schema"


const mockPullData: Pull = {
  repo: 'iFixit/ifixit',
  pull_number: 39126,
  state: 'OPEN',
  title: 'Shopify Hotfix: Add order method to get customer email and use it in return emails',
  head_ref: '1a76cf540ec175ba6874cc3b4915955c40dab2da',
  qa_req: 1,
  created_at: 1628362800,
  updated_at: 1628362800,
  closed_at: null,
  merged_at: null,
  closes: null,
  interacted: false,
  interacted_count: 0,
  qa_ready: false,
  qa_ready_count: 0,
}

describe('Parsing Pull Data', () => {
    test('Dates properly updated', async () => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        closedAt: null,
        createdAt: '2021-08-07T19:00:00Z',
        headRefOid: '1a76cf540ec175ba6874cc3b4915955c40dab2da',
        mergedAt: '2021-08-07T19:00:00Z',
        number: 39126,
        state: 'MERGED',
        title: 'Shopify Hotfix: Add order method to get customer email and use it in return emails',
        updatedAt: '2021-08-07T19:00:00Z',
      };
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData)

      expect(test_pull.closed_at).toBe(null);
      expect(test_pull.created_at).toBe(1628362800);
      expect(test_pull.updated_at).toBe(1628362800);
      expect(test_pull.merged_at).toBe(1628362800);
    });

    test('Parse QA Req', async () => {
      // CLoses and QA Req 0 declared in body text
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper Closes #39065 qa_req 0',
        closedAt: null,
        comments: {
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T23:46:32Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull = {
        closed_at: null,
        closes: 39065,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: false,
        qa_req: 0,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };

      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse Build Status', async () => {
      // Build status is failing
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: {
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T23:46:32Z',
                status: {
                  state: 'FAILURE',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: false,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };

      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse QA made after latest commit', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: {
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'QA 💡',
              createdAt: '2021-08-06T23:59:34Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T23:46:32Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: false,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };

      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse QA made before latest commit', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: {
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'QA 💡',
              createdAt: '2021-08-06T19:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T23:46:32Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull= {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: true,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse dev_block made after latest commit', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'dev_block 💡',
              createdAt: '2021-08-06T19:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: false,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse dev_block made before latest commit', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'dev_block 💡',
              createdAt: '2021-08-05T19:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull= {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: false,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse un_dev_block made before latest commit', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'cdcline',
              },
              bodyText: 'un_dev_block 🙌',
              createdAt: '2021-08-05T20:00:00Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'dev_block 💡',
              createdAt: '2021-08-05T19:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: true,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse multiple comments before dev_block ', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T20:59:34Z',
            },
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T19:59:34Z',
            },
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T18:59:34Z',
            },
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T17:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'dev_block 💡',
              createdAt: '2021-08-05T19:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: false,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse for qa ready and increment qa ready count', async () => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };

      const mock_db_pull_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 2,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 3,
        qa_ready: false,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628293608,
      };

      const expected_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 2,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 4,
        qa_ready: true,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mock_db_pull_data);
      expect(test_pull).toMatchObject(expected_data);
    });

    test('Parse for interaction after new commit', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'Comment with a question',
              createdAt: '2021-08-06T19:00:00Z',
            },
            {
              author: {
                login: 'deltuh-vee',
              },
              bodyText: 'Another comment with a question',
              createdAt: '2021-08-06T18:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 1,
        interacted: true,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: true,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [1628233200000, 1628146800000]);
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test('Parse for interaction with new commit and previous comments', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'Comment with a question',
              createdAt: '2021-08-05T19:00:00Z',
            },
            {
              author: {
                login: 'deltuh-vee',
              },
              bodyText: 'Another comment with a question',
              createdAt: '2021-08-04T18:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data:Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: true,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [1628233200000, 1628146800000]);
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);

      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockRestore();
    });

    test('Parse for interaction with new commit and previous comments', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'Comment with a question',
              createdAt: '2021-08-05T19:00:00Z',
            },
            {
              author: {
                login: 'deltuh-vee',
              },
              bodyText: 'Another comment with a question',
              createdAt: '2021-08-04T18:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };
      const expected_data:Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: true,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [1628233200000, 1628146800000]);
      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mockPullData);
      expect(test_pull).toMatchObject(expected_data);

      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockRestore();
    });

    test('Parse for interaction and increment interaction count', async() => {
      const mock_github_data: RecursivePartial<GitHubPullRequest> = {
        bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
        closedAt: null,
        comments: { // Comments are sorted in descending order of creation
          nodes: [
            {
              author: {
                login: 'mcTestyFace',
              },
              bodyText: 'Auctor parturient a tortor accumsan mus hac semper',
              createdAt: '2021-08-06T23:59:34Z',
            },
            {
              author: {
                login: 'ardelato',
              },
              bodyText: 'Comment with a question',
              createdAt: '2021-08-06T19:00:00Z',
            },
            {
              author: {
                login: 'deltuh-vee',
              },
              bodyText: 'Another comment with a question',
              createdAt: '2021-08-04T18:00:00Z',
            },
          ],
        },
        commits: {
          nodes: [
            {
              commit: {
                pushedDate: '2021-08-06T10:00:00Z',
                status: {
                  state: 'SUCCESS',
                },
              },
            },
          ],
        },
        createdAt: '2021-08-06T23:46:48Z',
        headRefOid: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        mergedAt: null,
        number: 39124,
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updatedAt: '2021-08-07T00:16:22Z',
      };

      const mock_db_pull_data: Pull= {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 2,
        interacted: false,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: true,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628293608,
      };

      const expected_data: Pull = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 3,
        interacted: true,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: true,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [1628233200000, 1628146800000]);

      const test_pull = await parsePull(mock_github_data as GitHubPullRequest, mock_db_pull_data);
      expect(test_pull).toMatchObject(expected_data);

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });
