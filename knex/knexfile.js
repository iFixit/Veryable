import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`) })

export default {
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  migrations: {
    directory: './migrations',
    tableName: 'qa_pulls',
  },
  debug: process.env.DEBUG ?? false,
}
