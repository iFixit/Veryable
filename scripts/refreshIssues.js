// Plan is to run this once to update all Issues current in the DB and append the labels as well as author to them
import Issue from '../db/db_issue.js';
import { queryIssue } from "../ghgraphql.js";

const DB_ISSUES = await Issue.getAllDBIssues();

for ( let db_issue of DB_ISSUES )
{

  try
  {
    const github_issue = await queryIssue( ...db_issue.getGraphQLValues() );
    parseIssue( github_issue.repository.issue, db_issue );
  } catch ( e )
  {
    console.error( "Failed to Retrieve and Parse " + JSON.stringify( db_issue.getGraphQLValues() ) + "\n" + e );
  }
}

function parseIssue( github_issue, db_issue )
{
  const data = { ...db_issue.data };
  updateDates( data, github_issue );
  updateValues( data, github_issue );
  db_issue.setNewValues( data );
}

function updateDates( issue_data, github_issue )
{
  issue_data.CreatedAt = new Date( github_issue.createdAt ).getTime() / 1000;
  issue_data.ClosedAt = new Date( github_issue.closedAt ).getTime() / 1000;
}

function updateValues( issue_data, github_issue )
{
  issue_data.Author = github_issue.author === null ? "ghost" : github_issue.author.login;
  issue_data.State = github_issue.state;
  issue_data.Labels = getGHLabels( github_issue.labels );
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