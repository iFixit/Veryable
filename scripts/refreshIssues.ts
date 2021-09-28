// Plan is to run this once to update all Issues current in the DB and append the labels as well as author to them
import Issue from '../db/db_issue.js';
import { queryIssues } from "../ghgraphql.js";

import config from "../config/config.js";
const REPOS = config.repos;

import logger from "../logger.js";
const log = logger( 'refreshIssues' );

const DB_ISSUES = await Issue.getAllDBIssues();


log.info( "Running script...\n" );

for (const repo of REPOS) {
// log.data( `Parsing Issues for repo: ${ JSON.stringify( repo ) }` );
let issues = await queryIssues(repo);
let endCursor = issues.repository.issues.pageInfo.endCursor;
let hasNextPage = issues.repository.issues.pageInfo.hasNextPage;
let all_issues = issues.repository.issues.nodes;
log.info( `Has next is ${ hasNextPage }` );
log.data( `Current issues: ${ JSON.stringify( all_issues,null,2 )  }` );
await parseIssues( all_issues );

while ( hasNextPage )
{
  log.info( `Iterating... ${endCursor}` );
  issues = await queryIssues( repo, endCursor );
  endCursor = issues.repository.issues.pageInfo.endCursor;
  hasNextPage = issues.repository.issues.pageInfo.hasNextPage;
  all_issues = issues.repository.issues.nodes;
  await parseIssues( all_issues );
}

log.data( `Returned issues: ${ JSON.stringify( all_issues, null, 2) }` );

log.info( "Finished script...\n" );
}



async function parseIssues( github_issues )
{
  log.info( 'Parsing Issues' );
  for ( const issue of github_issues )
  {
    const __FOUND = DB_ISSUES.map( db_issue =>
    {
      return db_issue.getUniqueID();
    } ).indexOf( `${issue.repo} #${ issue.number }` );
    log.data( `Issue ${ issue.title } was found: ${ __FOUND }` );
    await parseIssue( issue, __FOUND >= 0 ? DB_ISSUES[ __FOUND ] : null );
  }
};

async function parseIssue( github_issue, db_issue )
{
  log.info( `Parsing Issue ${ github_issue.title }` );
  if ( db_issue === null )
  {
    db_issue = new Issue();
    db_issue.gitInit(github_issue)
  }
  const data = { ...db_issue.data };
  updateDates( data, github_issue );
  updateValues( data, github_issue );
  await db_issue.setNewValues( data );
}

function updateDates( issue_data, github_issue )
{
  issue_data.created_at = new Date( github_issue.createdAt ).getTime() / 1000;
  issue_data.closed_at = new Date( github_issue.closedAt ).getTime() / 1000;
}

function updateValues( issue_data, github_issue )
{
  try
  {
    issue_data.author = github_issue.author === null ? "ghost" : github_issue.author.login;
    issue_data.state = github_issue.state;
    issue_data.labels = getGHLabels( github_issue.labels );
  } catch ( e )
  {
    log.error( new Error( e ) );
  }
}

function getGHLabels( github_issue_labels )
{
  let labels = [];
  for ( let label of github_issue_labels.nodes )
  {
    labels.push( label.name );
  }
  return labels.length > 0 ? JSON.stringify( labels ) : null;
}
