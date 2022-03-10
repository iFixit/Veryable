import config from '../config/config'
const { repos } = config

import Pull from '../db/db_pull'
import { parsePull } from '../controllers/pull_controller'

import logger from './logger'
import { PullRequest as GitHubPullRequest } from '@octokit/graphql-schema';

import { queryOpenPullsWithTimeline, queryPullsWithTimeline } from './ghgraphql'
import { parseTimeline } from '../controllers/pull_history_controller'
import PullHistoryRecorder from '../db/db_pull_history'
import { saveParsedItems } from '../controllers/save_controller'

import {utils} from '../scripts/utils'
import { updateDayMetrics } from '../controllers/day_controller'

const log = logger('main');

(async () => {
  await main()
  setInterval(main, 60 * 1000) //Run every 60 seconds
})()

async function main() {
  log.info('Running script...\n')

  // Iterate through repos defined in the config.ts file
  const promises = repos.map(async (repo) => {
    const results = await queryPullsWithTimeline(repo)
    const sanitized_github_pulls = utils.removeMaybeNulls(results.repository.pullRequests.nodes)
    return parsePulls(sanitized_github_pulls)
  })

  const setteld_parsed_items = await Promise.allSettled(promises)
  const fulfilled_parsed_items = retrieveValuesOfFulFilledPromises(setteld_parsed_items).flat(1)

  await saveParsedItems(fulfilled_parsed_items)
  await updateDayMetrics();

  log.info('Finished the script...\n')
}

function parsePulls(github_pulls: GitHubPullRequest[] | undefined):{ pull_to_save: Pull, pull_history_to_save: PullHistoryRecorder | null }[] {
  const items_to_save: { pull_to_save: Pull, pull_history_to_save: PullHistoryRecorder | null }[] = []
  github_pulls?.forEach(github_pull => {
    const pull = parsePull(github_pull)
    const sanitized_timeline_items = utils.removeMaybeNulls(github_pull.timelineItems.nodes)
    if (sanitized_timeline_items) {
      items_to_save.push(parseTimeline(pull, sanitized_timeline_items))
    } else {
      items_to_save.push({pull_to_save:pull, pull_history_to_save: null})
    }
  });

  return items_to_save
}

function retrieveValuesOfFulFilledPromises<Type>(settled_promises: PromiseSettledResult<Type>[]) {
  const fulfilled_promises = settled_promises.filter((promise) => promise.status === 'fulfilled') as PromiseFulfilledResult<Type>[]

  return fulfilled_promises.map((promise) => promise.value)
}