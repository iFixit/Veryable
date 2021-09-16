import { jest } from '@jest/globals'
import Pull from '../db/db_pull'
import db from '../knex/knex'
import { utils } from '../scripts/utils';


beforeAll(async () => {
  await db.schema.dropTableIfExists('qa_pulls').createTable('qa_pulls', table => {
    table.string('repo', 100).notNullable()
    table.integer('pull_number').notNullable()
    table.enum('state', ['OPEN', 'CLOSED', 'MERGED']).notNullable()
    table.string('title', 255).notNullable()
    table.string('head_ref', 40).notNullable()
    table.integer('qa_req', 1).defaultTo(1).notNullable()
    table.integer('created_at').nullable()
    table.integer('updated_at').nullable()
    table.integer('closed_at').nullable()
    table.integer('merged_at').nullable()
    table.integer('closes').nullable()
    table.integer('interacted', 1).defaultTo(0).notNullable()
    table.integer('interacted_count').defaultTo(0).nullable()
    table.integer('qa_ready', 1).defaultTo(0).notNullable()
    table.integer('qa_ready_count').defaultTo(0).nullable()
    table.primary(['repo', 'pull_number'])
  })
  await db('qa_pulls').del()
})

afterAll(async () => {
  await db.destroy()
})

async function db_insert() {
  await db('qa_pulls').insert([
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
        interacted: 1,
        interacted_count: 3,
        qa_ready: 1,
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
        interacted: 0,
        interacted_count: 0,
        qa_ready: 0,
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
        interacted: 1,
        interacted_count: 2,
        qa_ready: 0,
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
        interacted: 0,
        interacted_count: 0,
        qa_ready: 0,
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
        interacted: 0,
        interacted_count: 1,
        qa_ready: 1,
        qa_ready_count: 1,
      },
    ])
}

const defaultData = {
  repo: '',
  pull_number: 0,
  state: '',
  title: '',
  head_ref: '',
  qa_req: 1,
  created_at: 0,
  updated_at: 0,
  closed_at: null,
  merged_at: null,
  closes: null,
  interacted: 0,
  interacted_count: 0,
  qa_ready: 0,
  qa_ready_count: 0,
}

 const mockPullData = {
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
  interacted: 0,
  interacted_count: 0,
  qa_ready: 0,
  qa_ready_count: 0,
}

const updated_pull_data = {
  ...mockPullData,
  updated_at: 1628363900,
  interacted: 1,
  interacted_count: 2,
  qa_ready: 1,
  qa_ready_count: 3,
}
describe('Pull Class', () => {
  test('Connection Established', async () => {
    let data = await db.raw('Select 1+1 as result')
    expect(data[0]).toContainEqual({
      result: 2,
    })
  })
  describe('Initialization', () => {
    test('Empty constructor inits with default values', () => {
      let testPull = new Pull()
      expect(testPull.data).toMatchObject(defaultData)
    })
    test('Init with data passed to constructor', () => {
      let testPull = Pull.fromDataBase(mockPullData)
      expect(testPull.data).toMatchObject(mockPullData)
    })
    test('Init with GitHub Pull data', () => {
      let mockGitHubData: GitHubPullRequest = {
        closedAt: null,
        createdAt: '2021-08-07T19:00:00Z',
        headRefOid: '1a76cf540ec175ba6874cc3b4915955c40dab2da',
        baseRepository: {
          nameWithOwner: 'iFixit/ifixit',
        },
        number: 39126,
        state: 'OPEN',
        title: 'Shopify Hotfix: Add order method to get customer email and use it in return emails',
        updatedAt: '2021-08-07T19:00:00Z',
        mergedAt: null,
      }
      let testPull = Pull.fromGitHub(mockGitHubData)
      expect(testPull.data).toMatchObject(mockPullData)
    })
  })
  describe('Instance Methods', () => {
    test('getUniqueID returns "repo owner/name #pull number" ', () => {
      let testPull = Pull.fromDataBase(mockPullData)
      let expectedUniqueID = 'iFixit/ifixit #39126'
      expect(testPull.getUniqueID()).toBe(expectedUniqueID)
    })
    test('getGraphQLValues returns repo{ name, owner} pull number', () => {
      let testPull = Pull.fromDataBase(mockPullData)
      let expectedGraphQLValues = [{ name: 'ifixit', owner: 'iFixit' }, 39126]
      expect(testPull.getGraphQLValues()).toMatchObject(expectedGraphQLValues)
    })
    test('setNewValues changes Pull data', async () => {
      let testPull = Pull.fromDataBase(mockPullData)
      let spy = jest.spyOn(testPull, 'save').mockImplementation(() => Promise.resolve());


      expect(testPull.data).toMatchObject(mockPullData)

      testPull.setNewValues(updated_pull_data)
      expect(testPull.data).toMatchObject(updated_pull_data)
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockRestore()
    })
    describe('Saving Pull data', () => {
      beforeEach(async () => {
        await db('qa_pulls').del()
      })
      test('Setting values on new Pull creates new row ', async () => {
        let dataBefore = await db('qa_pulls').select()
        expect(dataBefore.length).toBe(0)

        let testPull = Pull.fromDataBase(mockPullData)
        await testPull.setNewValues(updated_pull_data)
        expect(testPull.data).toMatchObject(updated_pull_data)
        let dataAfter = await db('qa_pulls').select()
        expect(dataAfter.length).toBe(1)

        expect(dataAfter[0]).toMatchObject(testPull.data)
      })
      test('Setting new values on existing Pull updates row', async () => {
        let dataBefore = await db('qa_pulls').select()
        expect(dataBefore.length).toBe(0)

        let rowData = {
          repo: 'iFixit/ifixit',
          pull_number: 39126,
          state: 'OPEN',
          title:
            'Shopify Hotfix: Add order method to get customer email and use it in return emails',
          head_ref: '1a76cf540ec175ba6874cc3b4915955c40dab2da',
          qa_req: 1,
          created_at: 1628362800,
          updated_at: 1628363900,
          closed_at: 0,
          merged_at: 0,
          closes: null,
          interacted: 1,
          interacted_count: 2,
          qa_ready: 1,
          qa_ready_count: 3,
        }

        await db('qa_pulls').insert(rowData)
        let newData = await db('qa_pulls').select()
        expect(newData.length).toBe(1)
        expect(newData[0]).toMatchObject(rowData)

        let testPull = Pull.fromDataBase(newData[0])
        let mockUpdatePullData = {
          ...mockPullData,
          updated_at: 1628363900,
          closed_at: 1628363900,
          merged_at: 1628363900,
          interacted: 1,
          interacted_count: 3,
          qa_ready: 1,
          qa_ready_count: 5,
        }
        testPull.setNewValues(mockUpdatePullData)
        expect(testPull.data).toMatchObject(mockUpdatePullData)

        let dataAfter = await db('qa_pulls').select()
        expect(dataAfter.length).toBe(1)
        expect(dataAfter[0]).toMatchObject(testPull.data)
        expect(dataAfter[0]).toMatchObject(mockUpdatePullData)
      })
    })
  })
  describe('Static Methods', () => {
    beforeEach(async () => {
      await db('qa_pulls').del()
      await db_insert()
    })
    test('getDBPulls retrieves all OPEN pulls from database as Pull[]', async () => {
      let data = await Pull.getDBPulls()
      expect(data.length).toBe(3)

      data.forEach(pull => {
        expect(pull).toBeInstanceOf(Pull)
        expect(pull.data.state).toBe('OPEN')
      })
    })

    test('getQAReadyPullCount returns sum of all pulls who have QA Ready to 1||true', async () => {
      let data = await Pull.getQAReadyPullCount()
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
})
