import date from "date-and-time";
import Pull from './db/db_pull.js';

import config from "./config/config.js";
const SIGNATURES = config.signatures;
const QA_TEAM = config.qa_team;

export default function parsePull( github_pull, db_pull = null )
{
  if ( db_pull === null )
  {
    db_pull = new Pull();
    db_pull.gitInit( github_pull );
  }
  const data = { ...db_pull.data };
  console.log( 'Initial data structure' );
  console.log( data );
  updateDates( data, github_pull );
  console.log( 'After Date Updates:' );
  console.log( data );
  updateValues( data, github_pull );
  console.log( 'After value updates' );
  console.log( data );

  db_pull.setNewValues( data );
}

function updateDates( db_pull_data, github_pull )
{
  db_pull_data.UpdatedAt = new Date( github_pull.updatedAt ).getTime() / 1000;
  db_pull_data.ClosedAt = new Date( github_pull.closedAt ).getTime() / 1000;
  db_pull_data.MergedAt = new Date( github_pull.mergedAt ).getTime() / 1000;
}

function updateValues( db_pull_data, github_pull )
{
  console.log( "Entered updateValues" );
  console.log( db_pull_data );
  db_pull_data.HeadRef = github_pull.headRefOid;
  db_pull_data.State = github_pull.state;

  db_pull_data.Closes = closesDeclared( github_pull );

  qaReadyAndInteracted( db_pull_data, github_pull );
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

function qaReadyAndInteracted( db_pull_data, github_pull )
{
  let [ qaReady, qaInteracted ] = isQAReadyAndInteracted( db_pull_data, github_pull );
  console.log( `Returned QA Ready: ${ qaReady }, Current QA Ready: ${ db_pull_data.QAReady }, Current QA Count: ${ db_pull_data.QAReadyCount },` );

  db_pull_data.QAReadyCount += !db_pull_data.QAReady && qaReady ? 1 : 0;
  db_pull_data.QAReady = qaReady;

  db_pull_data.InteractedCount += !db_pull_data.Interacted & qaInteracted ? 1 : 0;
  db_pull_data.Interacted = qaInteracted;
}

// Iteratres through the Pull Object and retrieves the appropriate base properties
function isQAReadyAndInteracted( db_pull_data, github_pull )
{
  let build_status = github_pull.commits.nodes[ 0 ].commit.status
    ? github_pull.commits.nodes[ 0 ].commit.status.state
    : "EXPECTED";

  let qaReady = true;
  // Want to skip pulls that are marked as qa_req_0
  let qa_req = qaRequired( github_pull );
  if ( qa_req )
  {
    qaReady = false;
    db_pull_data.QAReq = false;
  }

  // Want to skip pulls that are failing CI
  if ( build_status !== "SUCCESS" && build_status !== "EXPECTED" )
  {
    qaReady = false;
  }

  // Want to skip pulls that are dev_block and already QA'd
  let [ tags, qaInteracted ] = getTagsAndInteracted( github_pull );
  if ( tags[ "dev_block" ] || tags[ "QA" ] )
  {
    qaReady = false;
  }

  return [ qaReady, qaInteracted ];
}

// Get Signaturse/Stamps
function getTagsAndInteracted( github_pull )
{
  let latest_commit_date = new Date( github_pull.commits.nodes[ 0 ].commit.pushedDate );
  let current_tags = {};
  let interacted = false;

  for ( const comment of github_pull.comments.nodes )
  {
    let comment_date = new Date( comment.createdAt );
    if ( hasQATag( comment.bodyText ) && date.subtract( latest_commit_date, comment_date ).toDays() <= 0 )
    {
      current_tags[ "QA" ] = true;
    } else
    {
      hasTags( comment.bodyText, current_tags );
    }

    if ( QA_TEAM.includes( comment.author.login ) && date.subtract( latest_commit_date, comment_date ).toDays() <= 0 )
    {
      interacted = true;
    }
  }

  return [ current_tags, interacted ];
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

// Check if the Pull requires QAing
function qaRequired( pull )
{
  let body = pull.bodyText;
  let qa_regex = new RegExp( SIGNATURES.qa_req, "i" );
  return qa_regex.test( body );
}