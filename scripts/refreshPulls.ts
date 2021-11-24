// Plan is to run this once to update all Pulls current in the DB that are still marked as OPEN yet the live Pull has been CLOSED or MERGED
import { Pull } from "@prisma/client"
import PullRequest from '../db/db_pull'
import { queryPull } from '../src/ghgraphql'
import { parsePull } from '../controllers/pull_controller'


import logger from '../src/logger'
export default async function (): Promise<void> {
  const db_pulls: Pull[] = await PullRequest.getDBPulls();
  const log = logger('refreshPull');

  db_pulls.forEach(async (db_pull: Pull) => {
    const github_pull = await queryPull(...PullRequest.getGraphQLValues(db_pull));
    if (github_pull.repository.pullRequest) {
      parsePull(github_pull.repository.pullRequest, db_pull);
    }
  });

  log.info('Done refreshing Pulls');
}
