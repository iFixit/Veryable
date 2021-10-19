import Pull from "../db/db_pull"
import DayMetric from "../db/db_day"
import {updateDayMetrics} from "../controllers/day_controller"

import { utils } from '../scripts/utils'

jest.mock('../db/db_pull')

const today_unix = 1628060400
const yesterday_unix = 1627974000

jest.spyOn(utils, 'getDates').mockImplementation(() => [today_unix, yesterday_unix]);

describe('DayController', () => {

  test('Pulls added should increase pull count and pulls added', async () => {
    const testDay = new DayMetric()

     testDay.metrics = {
      pull_count: 0,
      pulls_added: 0,
      unique_pulls_added: 0,
      pulls_interacted: 0,
      date: 0
     }

    jest.spyOn(testDay, 'getDayValues').mockReturnValue(
      {
        pull_count: 0,
        pulls_added: 0,
        unique_pulls_added: 0,
        pulls_interacted: 0,
        date: today_unix
      }
    )

    jest.spyOn(testDay,'save').mockImplementation(() => Promise.resolve())

    const mockQAPullCount = jest.fn().mockReturnValue(10)
    const mockQAUniqueCount = jest.fn().mockReturnValue(1)
    const mockInterationCount = jest.fn().mockReturnValue(1)

    Pull.getQAReadyPullCount = mockQAPullCount
    Pull.getQAReadyUniquePullCount = mockQAUniqueCount
    Pull.getInteractionsCount = mockInterationCount

    await updateDayMetrics(testDay)

    expect(testDay.metrics).toMatchObject({
      pull_count: 10,
      pulls_added: 10,
      unique_pulls_added: 1,
      pulls_interacted: 1,
      date: today_unix
    })

  });

   test('Pulls decreased should decrease pull count and pulls added is the same', async () => {
    const testDay = new DayMetric()

     testDay.metrics = {
      pull_count: 0,
      pulls_added: 0,
      unique_pulls_added: 0,
      pulls_interacted: 0,
      date: 0
     }

    jest.spyOn(testDay, 'getDayValues').mockReturnValue(
      {
        pull_count: 10,
        pulls_added: 2,
        unique_pulls_added: 0,
        pulls_interacted: 0,
        date: today_unix
      }
    )

    jest.spyOn(testDay,'save').mockImplementation(() => Promise.resolve())

    const mockQAPullCount = jest.fn().mockReturnValue(8)
    const mockQAUniqueCount = jest.fn().mockReturnValue(1)
    const mockInterationCount = jest.fn().mockReturnValue(1)

    Pull.getQAReadyPullCount = mockQAPullCount
    Pull.getQAReadyUniquePullCount = mockQAUniqueCount
    Pull.getInteractionsCount = mockInterationCount

    await updateDayMetrics(testDay)

    expect(testDay.metrics).toMatchObject({
      pull_count: 8,
      pulls_added: 2,
      unique_pulls_added: 1,
      pulls_interacted: 1,
      date: today_unix
    })

  });
})