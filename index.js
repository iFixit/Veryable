import dotenv from "dotenv";
dotenv.config();

import date from "date-and-time";

import config from "./config/config.js";
const repos = config.repos;
const signatures = config.signatures;

import queryGitHub from "./ghgraphql.js";
import Day from "./db/db_day.js";

// Automatically run script repeatedly
( async () =>
{
    main();
    setInterval( main, 60 * 1000 ); //Run every 60 seconds
} )();

async function main()
{

    let [ previous_pull_total, pulls_added ] = Day.getDayValues();
    let running_pull_total = 0;

    console.log( "Running script..." );
    console.log( "Previous Pull Total: " + previous_pull_total );

    // Iterate through the list of repos declared in the config.json file
    for ( const repo of repos )
    {
        const all_open_pulls = await queryGitHub( repo );
        running_pull_total += parsePulls(
            all_open_pulls.repository.pullRequests.nodes
        );
    }

    console.log( "Running Total: " + running_pull_total );

    let difference = running_pull_total - previous_pull_total;

    pulls_added += difference > 0 ? difference : 0;

    console.log( "New pulls added: " + pulls_added );

    Day.setPullCount( running_pull_total );
    Day.setPullsAdded( pulls_added );

    await Day.save();
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
