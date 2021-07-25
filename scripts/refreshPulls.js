// Plan is to run this once to update all Pulls current in the DB that are still marked as OPEN yet the live Pull has been CLOSED or MERGED

import dotenv from "dotenv";
dotenv.config();

import Pull from '../db/db_pull.js';
import { queryPull } from "../ghgraphql.js";

import config from "../config/config.js";
const SIGNATURES = config.signatures;
const QA_TEAM = config.qa_team;

import date from "date-and-time";

const DB_PULLS = await Pull.getDBPulls();

for ( let db_pull of DB_PULLS )
{
  const github_pull = await queryPull( ...db_pull.getGraphQLValues() );
  parsePull( github_pull.repository.pullRequest, db_pull );
}

function parsePull( github_pull, db_pull )
{
  const data = { ...db_pull.data };
  updateDates( data, github_pull );
  updateValues( data, github_pull );
  db_pull.setNewValues( data );
}

function updateDates( pull_data, github_pull )
{
  pull_data.UpdatedAt = new Date( github_pull.updatedAt ).getTime() / 1000;
  pull_data.ClosedAt = new Date( github_pull.closedAt ).getTime() / 1000;
  pull_data.MergedAt = new Date( github_pull.mergedAt ).getTime() / 1000;
}

function updateValues( pull_data, github_pull )
{
  pull_data.HeadRef = github_pull.headRefOid;
  pull_data.QAReq = qaRequired( github_pull );
  pull_data.Closes = closesDeclared( github_pull );

  let interacted = hasQAInteracted( github_pull );
  pull_data.InteractedCount += !pull_data.Interacted & interacted ? 1 : 0;
  pull_data.Interacted = interacted;

  if ( github_pull.state !== "OPEN" )
  {
    pull_data.State = github_pull.state;
  }
  else
  {
    let qaReady = isQAReady( github_pull );
    pull_data.QAReadyCount += !pull_data.QAReady && qaReady ? 1 : 0;
    pull_data.QAReady = qaReady;
  }
}

// Check if the Pull requires QAing
function qaRequired( pull )
{
  let body = pull.bodyText;
  let qa_regex = new RegExp( SIGNATURES.qa_req, 'i' );
  return qa_regex.test( body ) ? 1 : 0;
}

// Check if there is an Issue connected with Pull
function closesDeclared( pull )
{
  let body = pull.bodyText;
  let closes_regex = new RegExp( SIGNATURES.closes, 'i' );
  let closesPull = null;
  let __close;
  if ( ( __close = body.match( closes_regex ) ) !== null )
  {
    closesPull = parseInt( __close.groups.closes );
  }
  return closesPull;
}

function isQAReady( github_pull )
{
  let build_status = github_pull.commits.nodes[ 0 ].commit.status
    ? github_pull.commits.nodes[ 0 ].commit.status.state
    : "EXPECTED";

  // Want to skip pulls that are failing CI
  if ( build_status !== "SUCCESS" && build_status !== "EXPECTED" )
  {
    return 0;
  }

  // Want to skip pulls that are dev_block and already QA'd
  let tags = getTags( github_pull );
  if ( tags[ "dev_block" ] || tags[ "QA" ] )
  {
    return 0;
  }

  // Want to skip pulls that are marked as qa_req_0
  let qa_req = qaRequired( github_pull );
  if ( qa_req )
  {
    return 0;
  }

  return 1;
}

// Get Signaturse/Stamps
function getTags( pull )
{
  let latest_commit_date = new Date( pull.commits.nodes[ 0 ].commit.pushedDate );
  let current_tags = {};

  for ( const comment of pull.comments.nodes )
  {
    let comment_date = new Date( comment.createdAt );
    if ( hasQATag( comment.bodyText ) )
    {
      if ( date.subtract( latest_commit_date, comment_date ).toDays() <= 0 )
      {
        current_tags[ "QA" ] = true;
      }
    } else
    {
      hasTags( comment.bodyText, current_tags );
    }
  }

  return current_tags;
}

function hasQATag( comment )
{
  let regex = new RegExp( SIGNATURES.QA + SIGNATURES.emoji, "i" );
  return regex.test( comment );
}

function hasTags( comment, tags )
{
  SIGNATURES.tags.forEach( ( tag ) =>
  {
    let regex = new RegExp( tag.regex + SIGNATURES.emoji, "i" );
    if ( regex.test( comment ) )
    {
      tags[ "dev_block" ] = tag.state;
    }
  } );
}

function hasQAInteracted( github_pull )
{
  let latest_commit_date = new Date( github_pull.commits.nodes[ 0 ].commit.pushedDate );

  for ( const comment of github_pull.comments.nodes )
  {
    let comment_date = new Date( comment.createdAt );
    if ( date.subtract( latest_commit_date, comment_date ).toDays() <= 0 )
    {
      if ( QA_TEAM.includes( comment.author.login ) )
      {
        return true;
      }
    }
  }
  return false;
}