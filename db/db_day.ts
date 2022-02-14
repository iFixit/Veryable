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
      log.error('Failed to save Day %d\n\t%s', this.metrics.date, e);
    }
  }

  getDayValues(): Day
  {
    return utils.deepCopy(this.metrics);
  }
}


