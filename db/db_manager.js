import dotenv from "dotenv";
dotenv.config();

import knex from 'knex';

let db = knex( {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'metrics_dummy'
  },
  // debug: true,
} );

try
{
  await db.raw( 'Select 1+1 as result' );
  console.log( "Successfully connected to database" );
} catch ( e )
{
  console.error( "Error connection to database: " + e.message );
}

export default db;