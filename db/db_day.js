import date from "date-and-time";
import db from "./db_manager.js";

import logger from '../logger.js';
const log = logger( 'db_day' );

let [ today, yesterday ] = getDates();
const TWENTY_FOUR_HOURS = 86400;

export default class Day
{
  constructor()
  {
    this.dayMetrics = {
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    };
  }


  // Initial the day
  async init()
  {
    let day = await db( 'qa_metrics' ).first().where( { "date": today } ).orWhere( { "date": yesterday } ).orderBy( "date", "desc" );

    log.data( `Day Data ${ JSON.stringify( day, null, 2 ) }` );

    if ( day )
    {
      this.dayMetrics.pull_count = day.pull_count;
      log.data( ` Today's date and yesterday's date ${ today } , ${ day.date }` );
      log.data( ` Value for Pulls added is ${ today - day.date === TWENTY_FOUR_HOURS ? 0 : day.pulls_added } ` );
      if ( today - day.date !== TWENTY_FOUR_HOURS )
      {
        this.dayMetrics.pulls_added = day.pulls_added;
      }
    }
    else
    {
      log.data( 'Not initing with previous day data' );
      this.save();
    }
  };

  // Insert the new Day in the table and if it exists Update the values accordingly
  async save( newMetrics = null )
  {
    if ( today !== Math.floor( new Date().setHours( 0, 0, 0, 0 ) / 1000 ) )
    {
      [ today, yesterday ] = getDates();
      this.setPullsAdded( 0 );
    }
    this.dayMetrics = newMetrics ? newMetrics : this.dayMetrics;
    try
    {
      await db( 'qa_metrics' )
        .insert( { "date": today, ...this.dayMetrics } )
        .onConflict( "date" ).merge();
    } catch ( e )
    {
      log.error( "Failed to save Day " + e.message );
    }
  }

  getDayValues()
  {
    return { ...this.dayMetrics };
  }

  getPullCount()
  {
    return this.dayMetrtics.pull_count;
  }

  setPullCount( value )
  {
    this.dayMetrtics.pull_count = value;
  }

  getPullsAdded()
  {
    return this.dayMetrtics.pulls_added;
  }

  setPullsAdded( value )
  {
    this.dayMetrtics.pulls_added = value;
  }

  getInteractionsCount()
  {
    return this.dayMetrtics.pulls_interacted;
  }

  setInteractionsCount( value )
  {
    this.dayMetrtics.pulls_interacted = value;
  }

  getUniquePullsAddedCount()
  {
    return this.dayMetrtics.unique_pulls_added;
  }

  setUniquePullsAdded( value )
  {
    this.dayMetrtics.unique_pulls_added = value;
  }
};

function getDates()
{
  let today = Math.floor( new Date().setHours( 0, 0, 0, 0 ) / 1000 );
  let yesterday = Math.floor( date.addDays( new Date(), -1 ).setHours( 0, 0, 0, 0 ) / 1000 );
  return [ today, yesterday ];
}
