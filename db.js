import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config(); // Can use {path: 'path/to/.env'} in the future

const sequelize = new Sequelize(
  'metrics_dummy',
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: 'localhost',
    dialect: 'mysql'
  } );

try
{
  await sequelize.authenticate();
  console.log( 'Connection has been established successfully' );
} catch ( error )
{
  console.error( 'Unable to connect to the database:', error );
}

sequelize.close();