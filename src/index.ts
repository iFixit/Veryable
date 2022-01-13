import config from '../config/config'
const { repos } = config

import { queryOpenPulls } from './ghgraphql'

import DayMetric from '../db/db_day'
const DAY = new DayMetric()

import Pull from '../db/db_pull'
import { PullRequest } from '@prisma/client'
let DB_PULLS: PullRequest[]

import { updateDayMetrics } from '../controllers/day_controller';
import { parsePull } from '../controllers/pull_controller'

import logger from './logger'
import { PullRequest as GitHubPullRequest, Maybe } from '@octokit/graphql-schema';

const log = logger('main');

// Automatically run script repeatedly
(async () => {
  DB_PULLS = await Pull.getDBPulls();
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

async function parsePulls(github_pulls: Maybe<Maybe<GitHubPullRequest>[]> | undefined) {
  const unique_id_pulls = DB_PULLS.map(db_pull => {
    return Pull.getUniqueID(db_pull)
  })

  github_pulls?.forEach(async github_pull => {
    if (github_pull) {
      const found = unique_id_pulls.indexOf(`${github_pull.baseRepository?.nameWithOwner} #${github_pull.number}`)

      if (found < 0) {
        const pull = await parsePull(github_pull, null)
        DB_PULLS.push(pull)
      } else {
        DB_PULLS[found] = await parsePull(github_pull, DB_PULLS[found])
      }
    }
  });
}
