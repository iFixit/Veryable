// Plan is to run this once to update all Pulls current in the DB that are still marked as OPEN yet the live Pull has been CLOSED or MERGED

import Pull from '../db/db_pull.js';
import { queryPull } from "../ghgraphql.js";
import parsePull from "../pullParser.js";

const DB_PULLS = await Pull.getDBPulls();

import logger from "./logger.js";
const log = logger( 'refreshPull' );

for ( let db_pull of DB_PULLS )
{
  const github_pull = await queryPull( ...db_pull.getGraphQLValues() );
  parsePull( github_pull.repository.pullRequest, db_pull );
}

log.info( 'Done refreshing Pulls' );