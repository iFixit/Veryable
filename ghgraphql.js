import { graphql } from "@octokit/graphql";
import config from "./config/config.js";
const get_open_pulls = config.GET_OPEN_PULLS;
const get_pull = config.GET_PULL;

export async function queryPull( repo, pullNumber )
{
  return await graphql(
    get_pull( repo.name, repo.owner, pullNumber ),
    {
      headers: {
        authorization: `token ${ process.env.GITHUB_TOKEN }`,
      },
    }
  );
};


export async function queryOpenPulls( repo )
{
  return await graphql(
    get_open_pulls( repo.name, repo.owner, 50 ), //Limiting it to 50 open pulls,
    {
      headers: {
        authorization: `token ${ process.env.GITHUB_TOKEN }`,
      },
    }
  );
}