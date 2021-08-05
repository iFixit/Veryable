import dotenv from "dotenv";
dotenv.config();

import knex from 'knex';
import logger from '../logger.js';
const log = logger( 'db_manager' );

let db = knex( {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'metrics_dummy'
  },
  debug: process.env.NODE_ENV === 'db_debug' ? true : false,
} );

try
{
  await db.raw( 'Select 1+1 as result' );
  log.info( "Successfully connected to database" );
} catch ( e )
{
  log.error( "Error connection to database: " + e.message );
}

export default db;