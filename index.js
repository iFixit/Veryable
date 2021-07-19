import dotenv from "dotenv";
dotenv.config();

import { graphql } from "@octokit/graphql";
import ProgressBar from "progress";
import date from "date-and-time";
import path from "path";
import { Low, JSONFile } from "lowdb";

import config from "./config.js";
const repos = config.repos;
const signatures = config.signatures;

const file = path.resolve( "./db.json" );
const adapter = new JSONFile( file );
const db = new Low( adapter );

// Initialize JSON Database
await db.read();
db.data || ( db.data = {} );

// Get Today's date
let today = date.format( new Date(), "MM-DD-YYYY" );
let yesterday = date.addDays( new Date(), -1 );


// Sets Auth token for all future requests
const ghqlAuthed = graphql.defaults( {
    headers: {
        authorization: `token ${ process.env.GITHUB_TOKEN }`,
    },
} );

/* Strucutre
 * @state => Pull Status (OPEN, CLOSED, MERGED)
 * @bodyText => Pull Description (Holds the qa_req_# argument)
 * @commits => Pull commits array (has date commit was made and build status--i.e. CI status)
 * @comments => Pull comments array (has up to the latest 50 comments from a pull)
 */

const PULL_INFO = `
    state,
    title,
    number,
    bodyText,
    commits(last: 1){
        nodes{
            commit{
                pushedDate,
                status{
                    state
                }
            }
        }
    },
    comments(last:50){
        nodes{
            bodyText,
            createdAt
        }
    },
`;

const GET_OPEN_PULLS = ( repo, owner, limitsize ) => `
    {
        repository(name: "${ repo }", owner: "${ owner }") {
            pullRequests(states: OPEN, first: ${ limitsize }, orderBy: {field: CREATED_AT, direction: DESC} ) {
                totalCount,
                nodes {
                   ${ PULL_INFO }
                }
            }
        }
    }
`;

// Automatically run script repeatedly
( async () =>
{
    main();
    setInterval( main, 60 * 1000 ); //Run every 60 seconds
} )();

function initializeCounts()
{
    let pull_total, day_total = 0;
    if ( db.data[ today ] && db.data[ today ].day_total )
    {
        pull_total = db.data[ today ].day_total;
    }
    else if ( db.data[ yesterday ] && db.data[ yesterday ].day_total )
    {
        pull_total = db.data[ yesterday ].day_total;
    }

    if ( db.data[ today ] && db.data[ today ].pulls_added )
    {
        day_total = db.data[ today ].pulls_added;
    }
    return [ pull_total, day_total ];
}

async function main()
{

    let [ previous_pull_total, day_pull_count ] = initializeCounts();
    let running_pull_total = 0;
    console.log( "Running script..." );
    console.log( "Previous Pull Total: " + previous_pull_total );

    // Iterate through the list of repos declared in the config.json file
    for ( const repo of repos )
    {
        const all_open_pulls = await ghqlAuthed(
            GET_OPEN_PULLS( repo.name, repo.owner, 50 ) //Limiting it to 50 open pulls
        );
        console.log( "Total Pulls: " + all_open_pulls.repository.pullRequests.totalCount );
        running_pull_total += parsePulls(
            all_open_pulls.repository.pullRequests.nodes
        );
        console.log( running_pull_total );
    }
    console.log( "Running Total: " + running_pull_total );

    let difference = running_pull_total - previous_pull_total;
    day_pull_count += difference > 0 ? difference : 0;
    console.log( "New pulls added: " + day_pull_count );
    db.data[ today ] = {
        day_total: running_pull_total,
        pulls_added: day_pull_count,
    };
    console.log( db.data );
    await db.write();
    console.log( "Finished script..." );
}

function parsePulls( github_pulls )
{
    let current_repo_pulls = 0;
    for ( const pull of github_pulls )
    {
        current_repo_pulls += isQAReady( pull );
    }
    return current_repo_pulls;
}

// Iteratres through the Pull Object and retrieves the appropriate base properties
function isQAReady( pull )
{
    let title = pull.title;
    let pr_number = pull.number;
    let build_status = pull.commits.nodes[ 0 ].commit.status
        ? pull.commits.nodes[ 0 ].commit.status.state
        : "EXPECTED";

    // Want to skip pulls that are failing CI
    if ( build_status !== "SUCCESS" && build_status !== "EXPECTED" )
    {
        console.log( "Pull " + title + " # " + pr_number + " is failing CI" );
        return 0;
    }

    // Want to skip pulls that are dev_block and already QA'd
    let tags = getTags( pull );
    if ( tags[ "dev_block" ] || tags[ "QA" ] )
    {
        console.log(
            "Pull " + title + " # " + pr_number + " is dev blocked or already QA"
        );

        return 0;
    }

    // Want to skip pulls that are marked as qa_req_0
    let qa_req = qaRequired( pull );
    if ( qa_req )
    {
        console.log( "Pull " + title + " # " + pr_number + " is QA Req 0" );

        return 0;
    }
    console.log( "Returning 1 for " + "Pull " + title + " # " + pr_number );
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
    let regex = new RegExp( signatures.QA + signatures.emoji, "i" );
    return regex.test( comment );
}

function hasTags( comment, tags )
{
    signatures.tags.forEach( ( tag ) =>
    {
        let regex = new RegExp( tag.regex + signatures.emoji, "i" );
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
    let qa_regex = new RegExp( signatures.qa_req, "i" );
    return qa_regex.test( body );
}
