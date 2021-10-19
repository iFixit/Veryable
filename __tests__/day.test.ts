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

    })

    describe("'today' is not in the database, but 'yesterday' is", () => {

      test("should init with today's date but the 'pull_count' will be set to 'yesterday'.'pull_count' value ", async () => {
        const today: Day = {
          pull_count: 12,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0,
          date: today_unix
        }

        const yesterday: Day = {
          pull_count: 12,
          pulls_added: 15,
          pulls_interacted: 16,
          unique_pulls_added: 5,
          date: yesterday_unix
        }

        await prisma.day.create({ data: yesterday })

        const testDay = new DayMetric()
        await testDay.init()

        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(today)
      })

      test("should create a new day row with all values set to zero except for 'pull_count'", async () => {
          const today: Day = {
          pull_count: 12,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0,
          date: today_unix
        }

        const yesterday: Day = {
          pull_count: 12,
          pulls_added: 15,
          pulls_interacted: 16,
          unique_pulls_added: 5,
          date: yesterday_unix
        }

        await prisma.day.create({ data: yesterday })
        const testDay = new DayMetric()

        await testDay.init()
        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(today)

        await testDay.save()

        const data = await prisma.day.findMany({ orderBy: { 'date': 'desc' } })
        expect(data.length).toBe(2)
        expect(data).toMatchObject([today, yesterday])
      })
    })
    describe("'today' and 'yesterday' are in the database", () => {
      const today: Day = {
        date: today_unix,
        pull_count: 15,
        pulls_added: 3,
        pulls_interacted: 2,
        unique_pulls_added: 3,
      }

      const yesterday: Day = {
        date: yesterday_unix,
        pull_count: 12,
        pulls_added: 49,
        pulls_interacted: 15,
        unique_pulls_added: 4,
      }

      beforeEach(async () => {
        await prisma.day.createMany({
          data: [today, yesterday]
        })
      })

      test("should init with today's date and all values from today's row in the database", async () => {
        const testDay = new DayMetric()

        await testDay.init()
        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(today)


         const data = await prisma.day.findMany({ orderBy: { 'date': 'desc' } })

        expect(data.length).toBe(2)
        expect(data).toMatchObject([today,yesterday])
      })
      test('set new values for today', async () => {
        const updated_today: Day = {
          pull_count: 12,
          pulls_added: 4,
          pulls_interacted: 2,
          unique_pulls_added: 4,
          date: today_unix
        }
        const testDay = new DayMetric()

        await testDay.init()

        const dayValues = testDay.getDayValues()
        expect(dayValues).toMatchObject(today)

         testDay.setNewValues(updated_today)

        const dayAfter = testDay.getDayValues()
        expect(dayAfter).toMatchObject(updated_today)

        await testDay.save()
        const data = await prisma.day.findMany({ orderBy: { 'date': 'desc' } })

        expect(data.length).toBe(2)
        expect(data).toMatchObject([updated_today,yesterday])
      })
    })
  })
})
