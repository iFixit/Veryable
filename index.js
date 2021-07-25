import config from "./config/config.js";
const REPOS = config.repos;

import { queryOpenPulls } from "./ghgraphql.js";

import Day from "./db/db_day.js";
import Pull from "./db/db_pull.js";
const DB_PULLS = await Pull.getDBPulls();

import parsePull from "./pullParser.js";

// Automatically run script repeatedly
( async () =>
{
    main();
    setInterval( main, 60 * 1000 ); //Run every 60 seconds
} )();

async function main()
{
    console.log( "Running script..." );

    // Iterate through the list of repos declared in the config.json file
    // for ( const repo of REPOS )
    // {
    //     const all_open_pulls = await queryOpenPulls( repo );
    //     parsePulls(
    //         all_open_pulls.repository.pullRequests.nodes
    //     );
    // }

    await updateDayMetrics();
    console.log( "Finished script..." );
}

function parsePulls( github_pulls )
{
    for ( const pull of github_pulls )
    {
        const __FOUND = DB_PULLS.indexOf( ( db_pull, index ) =>
        {
            if ( db_pull.getUniqueID() === `${ pull.title } #${ pull.number }` )
            {
                console.log( "Found pull" );
                return true;
            }
        } );
        parsePull( pull, __FOUND >= 0 ? DB_PULLS[ __FOUND ] : null );
    }
}

async function updateDayMetrics()
{
    let currentMetrics = Day.getDayValues();

    console.log( "Previous Pull Total: " + currentMetrics.PullCount );
    let runningPullTotal = await Pull.getQAReadyPullCount();
    console.log( "Running Total: " + runningPullTotal );
    let difference = runningPullTotal - currentMetrics.PullCount;
    currentMetrics.PullCount += difference > 0 ? difference : 0;

    currentMetrics.UniquePullsAdded = await Pull.getQAReadyUniquePullCount();
    currentMetrics.Interactions = await Pull.getInteractionsCount();
    console.log( "Time Pulls Added Today: " + runningPullTotal );
    console.log( "Unique Pulls Added Today: " + currentMetrics.UniquePullsAdded );
    await Day.save( currentMetrics );
}
