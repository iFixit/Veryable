import { Day } from "@prisma/client";
import prisma from "../prisma/client"

import logger from '../src/logger';

import { utils } from '../scripts/utils'

const log = logger( 'db_day' );

export default class DayMetric
{
  metrics: Day

  yesterday?: Day | null;
  constructor()
  {
    this.metrics = {
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
      this.metrics.pull_count = this.yesterday.pull_count
    }
    this.metrics = await prisma.day.findFirst({ where: { 'date': today }, orderBy: { 'date': 'desc' } }) || {...this.metrics, date: today};

    log.data(`Day Data ${JSON.stringify(this.metrics, null, 2)}`);
  };

  // Insert the new Day in the table and if it exists Update the values accordingly
  async save(): Promise<void>
  {
    if ( this.isNewDay() )
    {
     let [ today, yesterday ] = utils.getDates();
      this.yesterday = this.metrics;
      this.metrics = {
        pull_count: this.yesterday?.pull_count || 0,
        pulls_added: 0,
        pulls_interacted: 0,
        unique_pulls_added: 0,
        date: today
      };
    }
    try
    {
      await prisma.day.upsert({
        where: { date: this.metrics.date },
        update: this.metrics,
        create: this.metrics
      })
    } catch ( e )
    {
      log.error( "Failed to save Day " + e );
    }
  }

  setNewValues(new_day_values: Day): void {
    this.metrics = { ...new_day_values, date: this.metrics.date}
  }

  getDayValues(): Day
  {
    return { ...this.metrics };
  }

  private isNewDay(): boolean{
    return this.metrics.date !== utils.getDates()[0]
  }
};


