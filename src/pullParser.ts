import Pull from '../db/db_pull'
import logger from './logger'

const log = logger('pullParser')

export default function parsePull(github_pull: GitHubPullRequest, db_pull: Pull): void {
  log.data(`Parsing Pull #${github_pull.number} ${github_pull.title}`)

  db_pull.updateDates(github_pull)
  db_pull.updateValues(github_pull)
  db_pull.save();
}
