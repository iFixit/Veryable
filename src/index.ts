import config from '../config/config'
const { repos } = config

import { parsePulls } from '../controllers/pull_controller'

import logger from './logger'

import { queryOpenPullsWithTimeline } from './ghgraphql'
import { saveParsedItems } from '../controllers/save_controller'

import {utils} from '../scripts/utils'
import { updateDayMetrics } from '../controllers/day_controller'

import {PromisePool} from '@supercharge/promise-pool'
const log = logger('main');

(async () => {
  await main()
  setInterval(main, 60 * 60 * 1000) //Run every hour
})()

async function main() {
  log.info('Running script...\n')

  // Iterate through repos defined in the config.ts file
  const settled_promises = await PromisePool.for(repos).process(async repo => {
    const results = await queryOpenPullsWithTimeline(repo)
    const sanitized_github_pulls = utils.removeMaybeNulls(results.repository.pullRequests.nodes)
    return parsePulls(sanitized_github_pulls)
  })

  const fulfilled_parsed_items = settled_promises.results.flat(1)

  await saveParsedItems(fulfilled_parsed_items)
  await updateDayMetrics();
  log.info('Updated day metrics')
  log.info('Finished the script...\n')
}