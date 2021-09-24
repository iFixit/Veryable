import logger from '../src/logger';
const log = logger('day_controller');

import DayMetric from '../db/db_day'
import Pull from '../db/db_pull'


export async function updateDayMetrics(day: DayMetric) {
  let current_metrics = day.getDayValues()
  let running_pull_total = await Pull.getQAReadyPullCount()
  //TODO: Fix bugwhen there is no yesterday so the difference is the entire qa ready total
  let difference = running_pull_total - current_metrics.pull_count

  log.data('Previous Pull Total: ' + current_metrics.pull_count)
  log.data('Running Total: ' + running_pull_total)
  log.data('Difference: ' + difference)
  log.data('Previous Pulls Added: ' + current_metrics.pulls_added)

  current_metrics.pulls_added += difference > 0 ? difference : 0
  current_metrics.pull_count = running_pull_total

  current_metrics.unique_pulls_added = await Pull.getQAReadyUniquePullCount(current_metrics.date)
  current_metrics.pulls_interacted = await Pull.getInteractionsCount(current_metrics.date)

  log.info('Current Pulls Today: ' + current_metrics.pull_count)
  log.info('Interactions Today: ' + current_metrics.pulls_interacted)
  log.info('Pulls Added Today: ' + current_metrics.pulls_added)
  log.info('Unique Pulls Added Today: ' + current_metrics.unique_pulls_added + '\n')

  day.setNewValues(current_metrics)
  await day.save()
}