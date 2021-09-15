import date from 'date-and-time'
import Pull from '../db/db_pull.js'

import config from '../config/config.js'
const SIGNATURES = config.signatures
const QA_TEAM = config.qa_team

import logger from './logger.js'
const log = logger('pullParser')

export default function parsePull(github_pull: GitHubPullRequest, db_pull: Pull): void {
  log.data(`Parsing Pull #${github_pull.number} ${github_pull.title}`)

  db_pull.updateDates(github_pull)
  db_pull.updateValues(github_pull)
  db_pull.save();
}
