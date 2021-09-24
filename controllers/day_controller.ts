export async function updateDayMetrics() {
  let current_metrics = DAY.getDayValues()
  let running_pull_total = await Pull.getQAReadyPullCount()
  //TODO: Fix bugwhen there is no yesterday so the difference is the entire qa ready total
  let difference = running_pull_total - current_metrics.pull_count

  log.data('Previous Pull Total: ' + current_metrics.pull_count)
  log.data('Running Total: ' + running_pull_total)
  log.data('Difference: ' + difference)
  log.data('Previous Pulls Added: ' + current_metrics.pulls_added)

  current_metrics.pulls_added += difference > 0 ? difference : 0
  current_metrics.pull_count = running_pull_total

  current_metrics.unique_pulls_added = await Pull.getQAReadyUniquePullCount(DAY.today)
  current_metrics.pulls_interacted = await Pull.getInteractionsCount(DAY.today)

  log.info('Current Pulls Today: ' + current_metrics.pull_count)
  log.info('Interactions Today: ' + current_metrics.pulls_interacted)
  log.info('Pulls Added Today: ' + current_metrics.pulls_added)
  log.info('Unique Pulls Added Today: ' + current_metrics.unique_pulls_added + '\n')

  await DAY.save(current_metrics)
}