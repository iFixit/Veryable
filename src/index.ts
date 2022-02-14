import config from '../config/config'
const { repos } = config

import DayMetric from '../db/db_day'
const DAY = new DayMetric()

import Pull from '../db/db_pull'
import { updateDayMetrics } from '../controllers/day_controller';
import { parsePull } from '../controllers/pull_controller'

import logger from './logger'
import { PullRequest as GitHubPullRequest, Maybe } from '@octokit/graphql-schema';

import { queryOpenPullsWithTimeline } from './ghgraphql'
import { parseTimeline } from '../controllers/pull_history_controller'
import PullHistoryRecorder from '../db/db_pull_history'
import { saveParsedItems } from '../controllers/save_controller'

const log = logger('main');

// Automatically run script repeatedly
(async () => {
  main()
  setInterval(main, 60 * 1000) //Run every 60 seconds
})()

async function main() {
  log.info('Running script...\n')

  // Iterate through repos defined in the config.ts file
  const setteld_parsed_items = await Promise.allSettled(repos.map(async(repo) => {
    const results = await queryOpenPullsWithTimeline(repo)
    const sanitized_github_pulls = removeMaybeNulls(results.repository.pullRequests.nodes)
    return parsePulls(sanitized_github_pulls)
  }))

  const fulfilled_parsed_items = retrieveValuesOfFulFilledPromises(setteld_parsed_items).flat(1)

  await saveParsedItems(fulfilled_parsed_items)
  await updateDayMetrics(DAY)
  log.info('Finished script...\n')
}

function parsePulls(github_pulls: GitHubPullRequest[] | undefined):{ pull_to_save: Pull, pull_history_to_save: PullHistoryRecorder | null }[] {
  const items_to_save: { pull_to_save: Pull, pull_history_to_save: PullHistoryRecorder | null }[] = []
  github_pulls?.forEach(github_pull => {
    const pull = parsePull(github_pull)
    const sanitized_timeline_items = removeMaybeNulls(github_pull.timelineItems.nodes)
    if (sanitized_timeline_items) {
      items_to_save.push(parseTimeline(pull, sanitized_timeline_items))
    } else {
      items_to_save.push({pull_to_save:pull, pull_history_to_save: null})
    }
  });

  return items_to_save
}

function removeMaybeNulls<Type>(unchecked_nodes: Maybe<Maybe<Type>[]> | undefined):Type[] | undefined {
  if (unchecked_nodes) {
    return unchecked_nodes.filter((node): node is Type => {
      return node !== null
    })
  }
}

function retrieveValuesOfFulFilledPromises<Type>(settled_promises: PromiseSettledResult<Type>[]) {
  const fulfilled_promises = settled_promises.filter((promise) => promise.status === 'fulfilled') as PromiseFulfilledResult<Type>[]

  return fulfilled_promises.map((promise) => promise.value)
}