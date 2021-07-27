
import date from 'date-and-time';
import Issue from '../db/db_issue.js';
import { queryDayIssues } from "../ghgraphql.js";
import config from "../config/config.js";
const QA_TEAM = config.qa_team;

let issues = await queryDayIssues( { name: "ifixit", owner: "iFixit" } );
console.log( issues.repository.issues.nodes );


for ( let issue of issues.repository.issues.nodes )
{
  parseIssue( issue );
}

function parseIssue( issue )
{
  let today = new Date();
  today.setUTCHours( 0, 0, 0, 0 );
  console.log( today.toDateString() );
  console.log( new Date( issue.createdAt ).toDateString() );
  let createdToday = date.isSameDay( new Date( issue.createdAt ), today );
  console.log( "Created today? " + createdToday );
  if ( createdToday && QA_TEAM.includes( issue.author.login ) )
  {
    console.log( "QA Team created issue today" );
  }
}