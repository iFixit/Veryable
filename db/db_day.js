import date from "date-and-time";
import db from "./db_manager.js";

import logger from '../src/logger.js';
const log = logger( 'db_day' );

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
    let [ t, y ] = this.getDates();
    this.today = t;
    this.yesterday = y;
    log.data( `Today's values are ${ this.today } and yesterday is ${ this.yesterday }` );

  }


  // Initial the day
  async init()
  {
    let day = await db( 'qa_metrics' ).first().where( { "date": this.today } ).orWhere( { "date": this.yesterday } ).orderBy( "date", "desc" );

    log.data( `Day Data ${ JSON.stringify( day, null, 2 ) }` );

    if ( day )
    {
      this.dayMetrics.pull_count = day.pull_count;
      log.data( ` Today's date and yesterday's date ${ this.today } , ${ day.date }` );
      log.data( ` Value for Pulls added is ${ this.today - day.date === TWENTY_FOUR_HOURS ? 0 : day.pulls_added } ` );
      if ( this.today - day.date !== TWENTY_FOUR_HOURS )
      {
        this.dayMetrics.pulls_added = day.pulls_added;
        this.dayMetrics.pulls_interacted = day.pulls_interacted;
        this.dayMetrics.unique_pulls_added = day.unique_pulls_added;
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
    if ( this.today !== Math.floor( new Date().setHours( 0, 0, 0, 0 ) / 1000 ) )
    {
      [ this.today, this.yesterday ] = this.getDates();
      this.dayMetrics.pulls_added = 0;
    }
    this.dayMetrics = newMetrics ? newMetrics : this.dayMetrics;
    try
    {
      await db( 'qa_metrics' )
        .insert( { "date": this.today, ...this.dayMetrics } )
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

  getPullsAdded()
  {
    return this.dayMetrtics.pulls_added;
  }

  getInteractionsCount()
  {
    return this.dayMetrtics.pulls_interacted;
  }

  getUniquePullsAddedCount()
  {
    return this.dayMetrtics.unique_pulls_added;
  }

  getDates()
  {
    let today = Math.floor( new Date().setHours( 0, 0, 0, 0 ) / 1000 );
    let yesterday = Math.floor( date.addDays( new Date(), -1 ).setHours( 0, 0, 0, 0 ) / 1000 );
    return [ today, yesterday ];
  }
};


