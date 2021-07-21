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
  });

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

sequelize.close();


const DBab = sequelize.define('qa_metrics', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  day_pull_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  day_pulls_added: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
})

await DBab.create({ date: "07-21-2021", day_pull_count: 0, day_pulls_added: 0 })