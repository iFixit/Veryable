import config from "./config/config.js";
const REPOS = config.repos;

import { queryOpenPulls } from "./ghgraphql.js";

import Day from "./db/db_day.js";
import Pull from "./db/db_pull.js";
const DB_PULLS = await Pull.getDBPulls();

import parsePull from "./pullParser.js";

import parentLogger from "./logger.js";
const logger = parentLogger( 'test-app' );

// Automatically run script repeatedly
( async () =>
{
    main();
    setInterval( main, 60 * 1000 ); //Run every 60 seconds
} )();

async function main()
{
    logger.info( "Running script..." );

    // Iterate through the list of repos declared in the config.json file
    for ( const repo of REPOS )
    {
        const all_open_pulls = await queryOpenPulls( repo );
        parsePulls(
            all_open_pulls.repository.pullRequests.nodes
        );
    }

    await updateDayMetrics();
    logger.info( "Finished script..." );
}

function parsePulls( github_pulls )
{
    for ( const pull of github_pulls )
    {

        const __FOUND = DB_PULLS.map( db_pull =>
        {
            return db_pull.getUniqueID();
        } ).indexOf( `${ pull.headRepository.nameWithOwner } #${ pull.number }` );
        parsePull( pull, __FOUND >= 0 ? DB_PULLS[ __FOUND ] : null );
    }
}

async function updateDayMetrics()
{
    let currentMetrics = Day.getDayValues();

    logger.info( "Previous Pull Total: " + currentMetrics.PullCount );
    let runningPullTotal = await Pull.getQAReadyPullCount();
    logger.info( "Running Total: " + runningPullTotal );
    let difference = runningPullTotal - currentMetrics.PullCount;
    logger.info( "Difference: " + difference );
    logger.info( "Previous Pulls Added: " + currentMetrics.PullsAdded );
    currentMetrics.PullsAdded += difference > 0 ? difference : 0;
    currentMetrics.PullCount = runningPullTotal;

    currentMetrics.UniquePullsAdded = await Pull.getQAReadyUniquePullCount();
    currentMetrics.Interactions = await Pull.getInteractionsCount();
    logger.info( "Interactions Today: " + currentMetrics.Interactions );
    logger.info( "Time Pulls Added Today: " + runningPullTotal );
    logger.info( "Unique Pulls Added Today: " + currentMetrics.UniquePullsAdded );
    await Day.save( currentMetrics );
}
