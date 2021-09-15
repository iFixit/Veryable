// Plan is to run this once to update all Pulls current in the DB that are still marked as OPEN yet the live Pull has been CLOSED or MERGED

import Pull from '../db/db_pull'
import { queryPull } from '../src/ghgraphql'
import parsePull from '../src/pullParser'


import logger from '../src/logger'
export default async function ():Promise<void> {
  const db_pulls = await Pull.getDBPulls();
  const log = logger('refreshPull');

  db_pulls.forEach(async (db_pull) => {
    const github_pull = await queryPull(...db_pull.getGraphQLValues());
    parsePull(github_pull.repository.pullRequest, db_pull);
  });

  log.info('Done refreshing Pulls');
}
