import { graphql } from "@octokit/graphql";
import config from "./config/config.js";
const get_open_pulls = config.GET_OPEN_PULLS;


export default async function queryGitHub( repo )
{
  // Sets Auth token for all future requests
  const ghqlAuthed = graphql.defaults( {
    headers: {
      authorization: `token ${ process.env.GITHUB_TOKEN }`,
    },
  } );

  return await ghqlAuthed(
    get_open_pulls( repo.name, repo.owner, 50 ) //Limiting it to 50 open pulls
  );
}