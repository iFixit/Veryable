import config from '../config/config'
const { repos } = config

import refreshPulls from '../scripts/refreshPulls';

import { queryOpenPulls } from './ghgraphql'

import DayMetric from '../db/db_day'
const DAY = new DayMetric()

import PullRequest from '../db/db_pull'
import { Pull } from '@prisma/client'
let DB_PULLS: Pull[]

import { updateDayMetrics } from '../controllers/day_controller';
import { parsePull } from '../controllers/pull_controller'

import logger from './logger'
const log = logger('main')

// Automatically run script repeatedly
;(async () => {
  DB_PULLS = await PullRequest.getDBPulls();
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
    await parsePulls(all_open_pulls.repository.pullRequests.nodes)
  }

  await updateDayMetrics(DAY)
  log.info('Finished script...\n')
}

async function parsePulls(github_pulls: GitHubPullRequest[]) {
  const unique_id_pulls = DB_PULLS.map(db_pull => {
    return PullRequest.getUniqueID(db_pull)
  })
  github_pulls.forEach(async github_pull => {
    let found = unique_id_pulls.indexOf(`${github_pull.baseRepository.nameWithOwner} #${github_pull.number}`)
    if (found < 0) {
      let pull = await parsePull(github_pull, null)
      DB_PULLS.push(pull)
    } else {
      DB_PULLS[found] = await parsePull(github_pull, DB_PULLS[found])
    }
  });
}
