import { PromisePool } from "@supercharge/promise-pool"
import logger from '../src/logger';
const log = logger('day_controller');

import DayMetric from '../db/db_day'

import prisma from "../prisma/client"
import { PullRequestHistory } from '@prisma/client';

import {utils} from "../scripts/utils"
import { DateTime } from 'luxon';

export async function updateDayMetrics() {
  const multi_day_metrics: { [start_date: string]: DayMetric } = {}

  await addPullsAddedByDay(multi_day_metrics)
  await addInteractionsByDay(multi_day_metrics)
  await addUniquePullsAddedByDay(multi_day_metrics)
  await addPullCountsByDay(multi_day_metrics)

  const metrics = Object.values(multi_day_metrics)

  return PromisePool.for(metrics).process(day_metric => {
    return day_metric.save()
  })
}

async function addPullsAddedByDay(multi_day_metrics: { [start_date: string]: DayMetric }) {
  const pulls_added_by_day = await prisma.pullRequestHistory.groupBy({
    by: ['start_date'],
    _count: {
      event: true
    },
    orderBy: {
      start_date: "asc"
    },
    where: {
      event: {
        equals: 'qa_ready'
      }
    }
  })

  pulls_added_by_day.forEach(day_count => {
    if (!multi_day_metrics[day_count.start_date]) {
      multi_day_metrics[day_count.start_date] = createNewDayMetric(day_count.start_date)
    }

    multi_day_metrics[day_count.start_date].setPullsAdded(day_count._count.event)
  })
}

async function addInteractionsByDay(multi_day_metrics: { [start_date: string]: DayMetric }) {
  const interactions = await prisma.pullRequestHistory.groupBy({
    by: ['start_date'],
      _count: {
      event: true
    },
    orderBy: {
      start_date: "asc"
    },
    where: {
      event: {
        equals: 'first_interaction'
      }
    }
  })

  interactions.forEach(day_count => {
    if (!multi_day_metrics[day_count.start_date]) {
      multi_day_metrics[day_count.start_date] = createNewDayMetric(day_count.start_date)
    }

    multi_day_metrics[day_count.start_date].setPullsInteracted(day_count._count.event)
  })
}

async function addUniquePullsAddedByDay(multi_day_metrics: { [start_date: string]: DayMetric }) {
  const ungrouped_unique_pulls_added = await prisma.pullRequestHistory.findMany({
    distinct: ['pull_request_id'],
    where: {
      event: 'qa_ready'
    },
    orderBy: {
      date: 'asc'
    }
  })

  const grouped_unique_pulls_added = ungrouped_unique_pulls_added.reduce(reduceByDay, {})

  for (const day in grouped_unique_pulls_added) {
    if (!multi_day_metrics[day]) {
      multi_day_metrics[day] = createNewDayMetric(parseInt(day))
    }
    multi_day_metrics[day].setUniquePullsAdded(grouped_unique_pulls_added[day].length)
  }
}

async function addPullCountsByDay(multi_day_metrics: { [start_date: string]: DayMetric }) {
  const ungrouped_pulls = await prisma.pullRequestHistory.findMany({
    distinct: ['pull_request_id', 'start_date'],
    where: {
      event: { in: [ 'qa_ready', 'non_qa_ready',] }
    },
    orderBy: {
      date: 'desc'
    }
  })

  // log.data('Returned Pull Count Query: %o',ungrouped_pulls)

  const grouped_pulls = ungrouped_pulls.reduce(reduceByPullRequest, {})

  // log.data('Reduced Events: %o', grouped_pulls)

  for (const pull in grouped_pulls) {

    const pull_events = grouped_pulls[pull]

    parseEventDays(pull_events, multi_day_metrics)

  }
}

function parseEventDays(events, multi_day_metrics) {
  let previous_qa_ready = false
  let previous_qa_ready_date = 0

  events.forEach(record => {

    if (record.event === 'qa_ready' && !previous_qa_ready) {

      checkAndAppendNewDay(multi_day_metrics, record.start_date)
      multi_day_metrics[record.start_date].incrementPullCount();

      previous_qa_ready = true
      previous_qa_ready_date = record.start_date
    }
    else if (record.event === 'qa_ready' && previous_qa_ready) {
      incrementPullCountUpToDate(previous_qa_ready_date, record.start_date, multi_day_metrics)
      checkAndAppendNewDay(multi_day_metrics, record.start_date)
      multi_day_metrics[record.start_date].incrementPullCount()
      previous_qa_ready_date = record.start_date
    }
    else if (record.event == 'non_qa_ready' && previous_qa_ready) {
      incrementPullCountUpToDate(previous_qa_ready_date, record.start_date, multi_day_metrics)

      previous_qa_ready = false
    }
  })

  const today = utils.getStartOfDayInUnixTime(DateTime.now().toSeconds())

  if (previous_qa_ready) {
    incrementPullCountUpToDate(previous_qa_ready_date, today, multi_day_metrics)
  }
}

function incrementPullCountUpToDate(start_date, end_date, multi_day_metrics) {
  const day_difference = differenceInDays(start_date,end_date)

  for (let day = 1; day < day_difference; day++) {
    const date = addDays(start_date, day)

    checkAndAppendNewDay(multi_day_metrics, date)
    multi_day_metrics[date].incrementPullCount()
  }
}

function checkAndAppendNewDay(multi_day_metrics, date) {
  if (!multi_day_metrics[date]) {
      multi_day_metrics[date] = createNewDayMetric(date)
  }
}

function differenceInDays(start_date: number, end_date: number): number {
  const start = DateTime.fromSeconds(start_date, { zone: 'UTC' })
  const end = DateTime.fromSeconds(end_date, {zone:'UTC'})
  return Math.floor(end.diff(start,'days').days)
}

function addDays(start_date: number, number_of_days: number): number {
  const start = DateTime.fromSeconds(start_date, { zone: 'UTC' })
  return start.plus({ days: number_of_days}).toSeconds()
}

function createNewDayMetric(date: number): DayMetric{
  return new DayMetric({
    date: date,
    pull_count: 0,
    pulls_added: 0,
    pulls_interacted: 0,
    unique_pulls_added: 0
  })
}

function reduceByDay(events_by_day: {[start_date: string]: PullRequestHistory[]}, event: PullRequestHistory) {
  if (!events_by_day[event.start_date]) {
    events_by_day[event.start_date] = []
  }
  events_by_day[event.start_date].push(event)
  return events_by_day;
}

function reduceByPullRequest(events_by_pull_request_id: { [pull_request_id: string]: PullRequestHistory[] }, event: PullRequestHistory) {
   if (!events_by_pull_request_id[event.pull_request_id]) {
    events_by_pull_request_id[event.pull_request_id] = []
  }
  events_by_pull_request_id[event.pull_request_id].unshift(event)
  return events_by_pull_request_id
}

export {addInteractionsByDay, addUniquePullsAddedByDay, addPullsAddedByDay, addPullCountsByDay}