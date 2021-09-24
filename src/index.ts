import config from '../config/config'
const { repos } = config

import refreshPulls from '../scripts/refreshPulls';

import { queryOpenPulls } from './ghgraphql'

import DayMetric from '../db/db_day'
const DAY = new DayMetric()

import Pull from '../db/db_pull'
let DB_PULLS: Pull[]

import { updateDayMetrics } from '../controllers/day_controller';
import parsePull from './pullParser'

import logger from './logger'
const log = logger('main')

// Automatically run script repeatedly
;(async () => {
  DB_PULLS = await Pull.getDBPulls();
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
  for (const repo of repos) {
    log.data(`Parsing pulls for repo: ${JSON.stringify(repo)}`)
    const all_open_pulls = await queryOpenPulls(repo)
    parsePulls(all_open_pulls.repository.pullRequests.nodes)
  }

  await updateDayMetrics(DAY)
  log.info('Finished script...\n')
}

function parsePulls(github_pulls: GitHubPullRequest[]) {
  const unique_id_pulls = DB_PULLS.map(db_pull => {
    return db_pull.getUniqueID()
  })
  github_pulls.forEach(github_pull => {
    let found = unique_id_pulls.indexOf(`${github_pull.baseRepository.nameWithOwner} #${github_pull.number}`)
    if (found < 0) {
      DB_PULLS.push(Pull.fromGitHub(github_pull))
      found = DB_PULLS.length - 1
    }
    parsePull(github_pull, DB_PULLS[found])
  });
}
