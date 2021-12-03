import { graphql } from '@octokit/graphql'
import { Repository } from "@octokit/graphql-schema"

import config from '../config/graphql_config'

const get_open_pulls = config.GET_OPEN_PULLS
const get_pull = config.GET_PULL
const get_issue = config.GET_ISSUE
const get_day_issues = config.GET_DAY_ISSUES
const get_issues = config.GET_ISSUES

export async function queryPull(repo: { name: string, owner: string }, pullNumber: number):
  Promise<{ repository: Repository }> {
  return graphql < { repository: Repository }>(
    get_pull(repo.name, repo.owner, pullNumber), {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    },
  );
}

export async function queryIssue(repo: { name: string, owner: string }, issueNumber: number) {
  return graphql(
    get_issue(repo.name, repo.owner, issueNumber), {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    },
  );
}

export async function queryDayIssues(repo: { name: string, owner: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return graphql(
    get_day_issues(repo.name, repo.owner, 50, today.toISOString()), {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    },
  );
}

export async function queryIssues(repo: { name: string, owner: string },
  cursor: string | null = null) {
  return graphql(
    get_issues(repo.name, repo.owner, cursor), {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    },
  );
}

export async function queryOpenPulls(repo: { name: string, owner: string }):
  Promise<{ repository: Repository }> {
  return graphql<{ repository: Repository }> (
    get_open_pulls(repo.name, repo.owner, 50), //Limiting it to 50 open pulls,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    },
  );
}
