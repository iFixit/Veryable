import { Day } from "@prisma/client";
import prisma from "../prisma/client"

import logger from '../src/logger';

import { utils } from '../scripts/utils'

const log = logger( 'db_day' );

export default class DayMetric
{
  dayMetrics: Day

  yesterday?: Day | null;
  constructor()
  {
    this.dayMetrics = {
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0,
      date: 0
    };
  }


  // Initial the day
  async init(): Promise<void> {
    let [today, yesterday] = utils.getDates();
    this.yesterday = await prisma.day.findFirst({ where: { date: yesterday } })

     log.data(`Today's values are ${today} and yesterday is ${this.yesterday?.date}`);
    if (this.yesterday) {
      this.dayMetrics.pull_count = this.yesterday.pull_count
    }
    this.dayMetrics = await prisma.day.findFirst({ where: { 'date': today }, orderBy: { 'date': 'desc' } }) || {...this.dayMetrics, date: today};

    log.data(`Day Data ${JSON.stringify(this.dayMetrics, null, 2)}`);
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


