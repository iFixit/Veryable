import { queryPullsWithTimeline } from "../src/ghgraphql"
import logger from '../src/logger'

import config from '../config/config'
import { PromisePool } from "@supercharge/promise-pool/dist/promise-pool";
import { utils } from "./utils";
import { parsePulls } from "../controllers/pull_controller";
import { saveParsedItems } from "../controllers/save_controller";
import { updateDayMetrics } from "../controllers/day_controller";
const { repos } = config

const log = logger('refreshPulls');

export default async function (): Promise<void> {
  log.info('Running script...\n')

  const settled_promises = await PromisePool.for(repos).process(async repo => {
    const results = await queryPullsWithTimeline(repo)
    const sanitized_github_pulls = utils.removeMaybeNulls(results.repository.pullRequests.nodes)
    return parsePulls(sanitized_github_pulls)
  })

  const fulfilled_parsed_items = settled_promises.results.flat(1)

  await saveParsedItems(fulfilled_parsed_items)
  await updateDayMetrics();
  log.info('Updated day metrics')
  log.info('Finished the script...\n')
}
