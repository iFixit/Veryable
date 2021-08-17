import { graphql } from '@octokit/graphql'
import config from './config/graphql_config.js'
const get_open_pulls = config.GET_OPEN_PULLS
const get_pull = config.GET_PULL
const get_issue = config.GET_ISSUE
const get_day_issues = config.GET_DAY_ISSUES
const get_issues = config.GET_ISSUES

export async function queryPull(repo, pullNumber) {
  return await graphql(get_pull(repo.name, repo.owner, pullNumber), {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  }).catch(error => console.error(error))
}

export async function queryIssue(repo, issueNumber) {
  return await graphql(get_issue(repo.name, repo.owner, issueNumber), {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  })
}

export async function queryDayIssues(repo) {
  let today = new Date().setHours(0, 0, 0, 0)

  return await graphql(get_day_issues(repo.name, repo.owner, 50, today.toISOString()), {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  })
}

export async function queryIssues(repo, cursor = null) {
  return await graphql(get_issues(repo.name, repo.owner, cursor), {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  })
}

export async function queryOpenPulls(repo) {
  return await graphql(
    get_open_pulls(repo.name, repo.owner, 50), //Limiting it to 50 open pulls,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }
  )
}
