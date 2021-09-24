import PullRequest from '../db/db_pull'
import { Pull } from '@prisma/client'
import prisma  from '../prisma/client';
import { utils } from '../scripts/utils';


beforeAll(async () => {
  await prisma.pull.deleteMany()
})

afterAll(async () => {
  await prisma.pull.deleteMany()
})

async function db_insert() {
  await prisma.pull.createMany({
    data: [
      {
        repo: 'iFixit/ifixit',
        pull_number: 39126,
        state: 'CLOSED',
        title:
          'Shopify Hotfix: Add order method to get customer email and use it in return emails',
        head_ref: '1a76cf540ec175ba6874cc3b4915955c40dab2da',
        qa_req: 1,
        created_at: 1628024709,
        updated_at: 1628024709,
        closed_at: 1628024709,
        merged_at: 1628024709,
        closes: null,
        interacted: true,
        interacted_count: 3,
        qa_ready: true,
        qa_ready_count: 5,
      },
      {
        repo: 'iFixit/ifixit',
        pull_number: 35543,
        state: 'MERGED',
        title: 'Stores: extract list provider',
        head_ref: '39f17dd5b7401541bbb98a302787324c3a1b3d3f',
        qa_req: 0,
        created_at: 1608252518,
        updated_at: 1628024709,
        closed_at: 1628024709,
        merged_at: 1628024709,
        closes: null,
        interacted: false,
        interacted_count: 0,
        qa_ready: false,
        qa_ready_count: 0,
      },
      {
        repo: 'iFixit/ifixit',
        pull_number: 38898,
        state: 'OPEN',
        title: 'Polish Community Landing Page',
        head_ref: '718a7bbba843149d06e864d6b9e9b2e89f13100b',
        qa_req: 1,
        created_at: 1627508542,
        updated_at: 1628024709,
        closed_at: 0,
        merged_at: 0,
        closes: null,
        interacted: true,
        interacted_count: 2,
        qa_ready: false,
        qa_ready_count: 4,
      },
      {
        repo: 'iFixit/ifixit',
        pull_number: 38997,
        state: 'OPEN',
        title: 'Correctly delete work log handoffs before deleting work logs',
        head_ref: 'e8f3e4a340d28a0c1e4bd4c786879acf440bcabc',
        qa_req: 1,
        created_at: 1628024709,
        updated_at: 1628024709,
        closed_at: 0,
        merged_at: 0,
        closes: null,
        interacted: false,
        interacted_count: 0,
        qa_ready: false,
        qa_ready_count: 0,
      },
      {
        repo: 'iFixit/valkyrie',
        pull_number: 532,
        state: 'OPEN',
        title: 'Fix translation strings for all categories',
        head_ref: '7ed298440cba90fb4055027feb661d9fa5401c75',
        qa_req: 1,
        created_at: 1628024709,
        updated_at: 1628024709,
        closed_at: 0,
        merged_at: 0,
        closes: 531,
        interacted: false,
        interacted_count: 1,
        qa_ready: true,
        qa_ready_count: 1,
      },
    ]
  })
}

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

describe('PullRequest Class', () => {
  describe('Static Methods', () => {
    test('get unique ID', () => {
      const unique_id = PullRequest.getUniqueID(mockPullData)
      const expectedUniqueID = 'iFixit/ifixit #39126'
      expect(unique_id).toBe(expectedUniqueID)
    })
    test('get GraphQL Values', () => {
      const graphql_values = PullRequest.getGraphQLValues(mockPullData)
      const expectedGraphQLValues = [{ name: 'ifixit', owner: 'iFixit' }, 39126]
      expect(graphql_values).toMatchObject(expectedGraphQLValues)
    })

  describe('Database Static Methods', () => {
    beforeAll(async () => {
      await prisma.pull.deleteMany();
      await db_insert()
    })

    afterAll(async () => prisma.pull.deleteMany());

    test('getDBPulls retrieves all OPEN pulls from database as Pull[]', async () => {
      const data = await Pull.getDBPulls()
      expect(data.length).toBe(3)

      data.forEach(pull => {
        expect(pull).toBeInstanceOf(Pull)
        expect(pull.data.state).toBe('OPEN')
      })
    })

    test('getQAReadyPullCount returns sum of all pulls who have QA Ready to 1||true', async () => {
      const data = await Pull.getQAReadyPullCount()
      expect(data).toBe(1)
    })
    test('getInteractionsCount returns sum of all pulls interacted for the day',async () => {
      const data = await Pull.getInteractionsCount(1628024709);
      expect(data).toBe(3);
    })
    test('getQAReadyUniquePullCount returns sum of all pulls only added to QA column for the day',async () => {
      const data = await Pull.getQAReadyUniquePullCount(1628024709);
      expect(data).toBe(2);
    })
  })

   describe('Parsing Pull Data', () => {
    test('Dates properly updated', () => {
      const test_pull = Pull.fromDataBase(mockPullData);
      const mock_github_data: GitHubPullRequest = {
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

      test_pull.updateDates(mock_github_data);
      expect(test_pull.data.closed_at).toBe(null);
      expect(test_pull.data.created_at).toBe(1628362800);
      expect(test_pull.data.updated_at).toBe(1628362800);
      expect(test_pull.data.merged_at).toBe(1628362800);
    });

    test('Parse QA Req', () => {
      // CLoses and QA Req 0 declared in body text
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: 39065,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: 0,
        qa_req: 0,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };

      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse Build Status', () => {
      // Build status is failing
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: 0,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };

      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse QA made after latest commit', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: 0,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };

      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse QA made before latest commit', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: 1,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse dev_block made after latest commit', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: 0,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse dev_block made before latest commit', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: 0,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse un_dev_block made before latest commit', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: 1,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse multiple comments before dev_block ', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 0,
        qa_ready: 0,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse for qa ready and increment qa ready count', () => {
      const mock_github_data:GitHubPullRequest = {
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

      const mock_db_pull_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 2,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 3,
        qa_ready: 0,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628293608,
      };

      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 2,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 4,
        qa_ready: 1,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const test_pull = Pull.fromDataBase(mock_db_pull_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
    });

    test('Parse for interaction after new commit', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 1,
        interacted: 1,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: 1,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [1628233200000, 1628146800000]);
      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    test('Parse for interaction with new commit and previous comments', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: 1,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [1628233200000, 1628146800000]);
      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);

      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockRestore();
    });

    test('Parse for interaction with new commit and previous comments', () => {
      const mock_github_data:GitHubPullRequest = {
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
      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 0,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: 1,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [1628233200000, 1628146800000]);
      const test_pull = Pull.fromGitHub(mock_github_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);

      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockRestore();
    });

    test('Parse for interaction and increment interaction count', () => {
      const mock_github_data:GitHubPullRequest = {
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

      const mock_db_pull_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 2,
        interacted: 0,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: 1,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628293608,
      };

      const expected_data = {
        closed_at: null,
        closes: null,
        created_at: 1628293608,
        head_ref: 'a63f564828f2e6a93babc6f37346f2e54a42105f',
        interacted_count: 3,
        interacted: 1,
        merged_at: null,
        pull_number: 39124,
        qa_ready_count: 1,
        qa_ready: 1,
        qa_req: 1,
        repo: 'iFixit/ifixit',
        state: 'OPEN',
        title: 'Reset cache before each CustomerMapperTest',
        updated_at: 1628295382,
      };
      const spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [1628233200000, 1628146800000]);

      const test_pull = Pull.fromDataBase(mock_db_pull_data);
      test_pull.updateValues(mock_github_data);
      expect(test_pull.data).toMatchObject(expected_data);

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });
})
