import { Day } from "@prisma/client";
import prisma from "../prisma/client"

import logger from '../src/logger';

import { utils } from '../scripts/utils'

const log = logger( 'db_day' );

export default class DayMetric
{
  metrics: Day

  constructor (metrics: Day) {
    this.metrics = utils.deepCopy(metrics)
  }

  async save(): Promise<void> {
    try {
      await prisma.day.upsert({
        where: { date: this.metrics.date },
        update: this.metrics,
        create: this.metrics
      })
    } catch (e) {
      log.error('Failed to save Day %s\n\t%s', utils.getISOTimeFromUnix(this.metrics.date), e);
    }
  }

  getDayValues(): Day
  {
    return utils.deepCopy(this.metrics);
  }

  setUniquePullsAdded(unique_pulls_added: number): void{
    this.metrics.unique_pulls_added = unique_pulls_added
  }

  setPullsAdded(pulls_added: number): void{
    this.metrics.pulls_added = pulls_added
  }

  setPullsInteracted(interactions: number): void{
    this.metrics.pulls_interacted = interactions
  }

  setPullCount(end_of_day_pull_count: number): void{
    this.metrics.pull_count = end_of_day_pull_count
  }

  incrementPullCount(): void{
    this.metrics.pull_count+=1
  }
}


