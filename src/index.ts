import config from '../config/config'
const REPOS = config.repos

import refreshPulls from '../scripts/refreshPulls';

import { queryOpenPulls } from './ghgraphql'

import Day from '../db/db_day'
const DAY = new Day()
await DAY.init()

import Pull from '../db/db_pull'
const DB_PULLS = await Pull.getDBPulls()

import parsePull from './pullParser'

import logger from './logger'
const log = logger('main')

// Automatically run script repeatedly
;(async () => {
  log.info('Will now refresh current open pulls in DB')
  // Refresh any open pulls since last start up and block code until done
  await refreshPulls()
  log.info('Done refreshing pulls')
  main()
  setInterval(main, 60 * 1000) //Run every 60 seconds
})()

async function main() {
  log.info('Running script...\n')

  // Iterate through the list of repos declared in the config.json file
  for (const repo of REPOS) {
    log.data(`Parsing pulls for repo: ${JSON.stringify(repo)}`)
    const all_open_pulls = await queryOpenPulls(repo)
    parsePulls(all_open_pulls.repository.pullRequests.nodes)
  }

  await updateDayMetrics()
  log.info('Finished script...\n')
}

function parsePulls(github_pulls) {
  const unique_id_pulls = DB_PULLS.map(db_pull => {
    return db_pull.getUniqueID()
  })
  for (const pull of github_pulls) {
    const found = unique_id_pulls.indexOf( `${ pull.baseRepository.nameWithOwner } #${ pull.number }` )
    if ( found < 0 )
    {
      DB_PULLS.push( Pull.fromGitHub( github_pull ) )
      found = DB_PULLS.length - 1
    }
    parsePull(pull, DB_PULLS[found])
  }
}

async function updateDayMetrics() {
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

  current_metrics.unique_pulls_added = await Pull.getQAReadyUniquePullCount()
  current_metrics.pulls_interacted = await Pull.getInteractionsCount()

  log.info('Current Pulls Today: ' + current_metrics.pull_count)
  log.info('Interactions Today: ' + current_metrics.pulls_interacted)
  log.info('Pulls Added Today: ' + current_metrics.pulls_added)
  log.info('Unique Pulls Added Today: ' + current_metrics.unique_pulls_added + '\n')

  await DAY.save(current_metrics)
}
