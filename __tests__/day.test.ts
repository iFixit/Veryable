import DayMetric from '../db/db_day'
import { utils } from '../scripts/utils'

import { Day } from "@prisma/client"
import prisma from '../prisma/client'

const today_unix = 1628060400 //Wed Aug 04 00:00:00 -0700 2021
const yesterday_unix = 1627974000 //Tue Aug 03 00:00:00 -0700 2021

// Mocking the dates it will be set to for today and yesteday
let get_dates_spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [today_unix, yesterday_unix]);

beforeEach(async () => {
    await prisma.day.deleteMany();
    get_dates_spy = jest.spyOn(utils, 'getDates').mockImplementation(() => [today_unix, yesterday_unix]);
})

afterAll(async () => {
  await prisma.day.deleteMany();
})

describe('DayMetric class', () => {

  describe('Day Value Conditions', () => {
    describe("'today' and 'yesterday' are not in the database", () => {

      test("should init today's date with all other values set to zero", async () => {
        const newDay: Day = {
          pull_count: 0,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0,
          date: today_unix
        }
        const testDay = new DayMetric()

        await testDay.init()
        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(newDay)
      })

      test('should create a new day row with all values set to zero', async () => {
        const newDay = {
          pull_count: 0,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0,
        }
        const testDay = new DayMetric()
        await testDay.init()

        const data = await db('qa_metrics').select()
        expect(data.length).toBe(1)
        expect(data[0]).toMatchObject(newDay)
      })
    })

    describe("'today' is not in the database, but 'yesterday' is", () => {
      beforeEach(async () => {
        await db('qa_metrics').del()
        await db('qa_metrics').insert([
          {
            date: yesterday_unix,
            pull_count: 12,
            pulls_added: 49,
            pulls_interacted: 15,
            unique_pulls_added: 4,
          },
        ])
      })

      test("should init with today's date but the 'pull_count' will be set to 'yesterday'.'pull_count' value ", async () => {
        const newDayWithYesterday = {
          pull_count: 12,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0,
        }
        const testDay = new DayMetric()
        const spy = jest.spyOn(testDay, 'save').mockImplementation(() => Promise.resolve())


        await testDay.init()
        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(newDayWithYesterday)

        expect(spy).toHaveBeenCalledTimes(0)
        const data = await db('qa_metrics').select()
        //Should not have saved a new row to the database just yet
        expect(data.length).toBe(1)
        spy.mockRestore()
      })
      test("should create a new day row with all values set to zero except for 'pull_count'", async () => {
        const newDayWithYesterday = {
          pull_count: 12,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0,
        }
        const testDay = new DayMetric()

        await testDay.init()
        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(newDayWithYesterday)
        await testDay.save()

        const data = await db('qa_metrics').select().orderBy('date', 'desc')
        //Should not have saved a new row to the database just yet
        expect(data.length).toBe(2)
        expect(data).toMatchObject([
          {
            date: 'today_unix',
            pull_count: 12,
            pulls_added: 0,
            pulls_interacted: 0,
            unique_pulls_added: 0,
          },
          {
            date: 'yesterday_unix',
            pull_count: 12,
            pulls_added: 49,
            pulls_interacted: 15,
            unique_pulls_added: 4,
          },
        ])
      })
    })
    describe("'today' and 'yesterday' are in the database", () => {
      beforeEach(async () => {
        await db('qa_metrics').del()
        await db('qa_metrics').insert([
          {
            date: today_unix,
            pull_count: 15,
            pulls_added: 3,
            pulls_interacted: 2,
            unique_pulls_added: 3,
          },
          {
            date: yesterday_unix, //Tue Aug 03 00:00:00 -0700 2021
            pull_count: 12,
            pulls_added: 49,
            pulls_interacted: 15,
            unique_pulls_added: 4,
          },
        ])
      })
      test("should init with today's date and all values from today's row in the database", async () => {
        const newDay = {
          pull_count: 15,
          pulls_added: 3,
          pulls_interacted: 2,
          unique_pulls_added: 3,
        }
        const testDay = new DayMetric()
        const spy = jest.spyOn(testDay, 'save').mockImplementation(() => Promise.resolve())


        await testDay.init()
        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(newDay)

        expect(spy).toHaveBeenCalledTimes(0)

        const data = await db('qa_metrics').select().orderBy('date', 'desc')
        //Should not have saved to the database just yet
        expect(data.length).toBe(2)
        expect(data).toMatchObject([
          {
            date: 'today_unix',
            pull_count: 15,
            pulls_added: 3,
            pulls_interacted: 2,
            unique_pulls_added: 3,
          },
          {
            date: 'yesterday_unix',
            pull_count: 12,
            pulls_added: 49,
            pulls_interacted: 15,
            unique_pulls_added: 4,
          },
        ])
        spy.mockRestore()
      })
      test('should not update the database when initing', async () => {
        const newDay = {
          pull_count: 15,
          pulls_added: 3,
          pulls_interacted: 2,
          unique_pulls_added: 3,
        }

        const dataBefore = await db('qa_metrics').select().orderBy('date', 'desc')

        const testDay = new DayMetric()

        await testDay.init()
        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(newDay)

        const dataAfter = await db('qa_metrics').select().orderBy('date', 'desc')
        expect(dataAfter).toMatchObject(dataBefore)
      })
    })
  })
})
