import { Day } from "@prisma/client";
import prisma from "../prisma/client"

import logger from '../src/logger';

import { utils } from '../scripts/utils'

const log = logger( 'db_day' );

const TWENTY_FOUR_HOURS = 86400;

export default class DayMetric
{
  dayMetrics: Day

  yesterday: number;
  constructor()
  {
    this.dayMetrics = {
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0,
      date: 0
    };
    let [ t, y ] = utils.getDates();
    this.dayMetrics.date = t;
    this.yesterday = y;
    log.data( `Today's values are ${ this.dayMetrics.date } and yesterday is ${ this.yesterday }` );

  }


  // Initial the day
  async init(): Promise<void> {
    let day = await db( 'qa_metrics' ).first().where( { "date": this.dayMetrics.date } ).orWhere( { "date": this.yesterday } ).orderBy( "date", "desc" );

    log.data( `Day Data ${ JSON.stringify( day, null, 2 ) }` );

    if ( day )
    {
      this.dayMetrics.pull_count = day.pull_count;
      log.data( ` Today's date and yesterday's date ${ this.dayMetrics.date } , ${ day.date }` );
      log.data( ` Value for Pulls added is ${ this.dayMetrics.date - day.date === TWENTY_FOUR_HOURS ? 0 : day.pulls_added } ` );
      if ( this.dayMetrics.date - day.date !== TWENTY_FOUR_HOURS )
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
  async save( newMetrics: Day | null = null ): Promise<void>
  {
    if ( this.isNewDay() )
    {
      [ this.dayMetrics.date, this.yesterday ] = utils.getDates();
      this.dayMetrics.pulls_added = 0;
    }
    this.dayMetrics = newMetrics || this.dayMetrics;
    try
    {
      await db( 'qa_metrics' )
        .insert( { ...this.dayMetrics } )
        .onConflict( "date" ).merge();
    } catch ( e )
    {
      log.error( "Failed to save Day " + e );
    }
  }

  getDayValues(): Day
  {
    return { ...this.dayMetrics };
  }

  private isNewDay(): boolean{
    return this.dayMetrics.date !== utils.getDates()[0]
  }
};


