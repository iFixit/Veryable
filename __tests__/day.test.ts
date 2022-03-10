import DayMetric from '../db/db_day'
import { Day } from "@prisma/client"
import { DateTime } from 'luxon'

describe('DayMetric class', () => {
  const today = Math.floor(DateTime.now().toSeconds())

  const mock_metrics: Day = {
    date: today,
    pull_count: 11,
    pulls_added: 5,
    pulls_interacted: 3,
    unique_pulls_added: 5
  }

  const day_metrics = new DayMetric(mock_metrics)
  test('Returns its current metrics', () => {
    expect(day_metrics.getDayValues()).toStrictEqual(mock_metrics)
  })

  test('Saves new date', async () => {
    const spy = jest.spyOn(day_metrics, 'save')
    await day_metrics.save();
    expect(spy).toBeCalledTimes(1)
  })
})
