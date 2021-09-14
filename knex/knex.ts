import knex from 'knex';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`) });

const config = {
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  debug: !!process.env.DEBUG, //converts to boolean value instead of truthy/falsy value
};

export default knex(config);
