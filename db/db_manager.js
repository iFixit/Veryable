import path from 'path';
import dotenv from "dotenv";
dotenv.config( { path: path.resolve( `.env.${ process.env.NODE_ENV ?? 'dev' }` ) } );

import knex from 'knex';
import logger from '../logger.js';

const log = logger( 'db_manager' );

let db = knex( {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  debug: process.env.DEBUG ?? false,
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