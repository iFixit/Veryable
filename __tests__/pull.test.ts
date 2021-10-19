import { seed_pulls } from './__helper'

import PullRequest from '../db/db_pull'
import { Pull } from '@prisma/client'
import prisma  from '../prisma/client';

beforeAll(async () => {
  await prisma.pull.deleteMany()
})

afterAll(async () => {
  await prisma.pull.deleteMany()
})

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
  })
  describe('Database Static Methods', () => {
    beforeAll(async () => {
      await prisma.pull.deleteMany();
      await seed_pulls()
    })

    afterAll(async () => prisma.pull.deleteMany());

    test('get all open pulls from database', async () => {
      let pulls: Pull[] = await PullRequest.getDBPulls()
      expect(pulls.length).toBe(3)

      pulls.forEach(pull => {
        expect(pull.state).toBe('OPEN')
      })
    })

    test('get QA ready pull count returns sum of all pulls who have QA Ready to true', async () => {
      const data = await PullRequest.getQAReadyPullCount()
      expect(data).toBe(1)
    })

    test('get interactions count returns sum of all pulls interacted for the day',async () => {
      const data = await PullRequest.getInteractionsCount(1628024709);
      expect(data).toBe(3);
    })

    test('get QA ready unique pull count returns sum of all pulls only added to QA column for the day',async () => {
      const data = await PullRequest.getQAReadyUniquePullCount(1628024709);
      expect(data).toBe(2);
    })
  })
})
