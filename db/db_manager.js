import knex from '../knex/knex.js';
import logger from '../src/logger.js';
const log = logger( 'db_manager' );

let db = knex;
try
{
  await db.raw( 'Select 1+1 as result' );
  log.info( "Successfully connected to database" );
} catch ( e )
{
  log.error( "Error connection to database: " + e.message );
}

export default db;