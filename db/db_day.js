import date from "date-and-time";
import db from "./db_manager.js";

const today = date.format( new Date(), "YYYY-MM-DD" );
const yesterday = date.format( date.addDays( new Date(), -1 ), "YYYY-MM-DD" );

class Day
{
  constructor()
  {
    this.dayMetrics = {
      PullCount: 0,
      PullsAdded: 0,
      Interactions: 0,
      UniquePullsAdded: 0
    };
  }

  // Initial the day
  async init()
  {
    let day = await db( 'qa_metrics' ).first().where( { "Date": today } ).orWhere( { "Date": yesterday } );

    if ( day )
    {
      this.dayMetrics.PullCount = day.PullCount;
      this.dayMetrics.PullsAdded = date.subtract( day.Date, new Date( today ) ).toDays() !== 0 && day.PullsAdded !== 0 ? day.PullsAdded : 0;
    }
    else
    {
      this.save();
    }
  };

  // Insert the new Day in the table and if it exists Update the values accordingly
  async save( newMetrics = null )
  {
    if ( today !== date.format( new Date(), "YYYY-MM-DD" ) )
    {
      yesterday = today;
      today = date.format( new Date(), "YYYY-MM-DD" );
      this.setPullsAdded( 0 );
    }
    this.dayMetrics = newMetrics ? newMetrics : this.dayMetrics;
    try
    {
      await db( 'qa_metrics' )
        .insert( { "Date": today, ...this.dayMetrics } )
        .onConflict( "Date" ).merge();
    } catch ( e )
    {
      console.error( "Failed to save Day " + e.message );
    }
  }

  getDayValues()
  {
    return { ...this.dayMetrics };
  }

  getPullCount()
  {
    return this.dayMetrtics.PullCount;
  }

  setPullCount( value )
  {
    console.log( this.dayMetrics );
    this.dayMetrtics.PullCount = value;
  }

  getPullsAdded()
  {
    return this.dayMetrtics.PullsAdded;
  }

  setPullsAdded( value )
  {
    this.dayMetrtics.PullsAdded = value;
  }

  getInteractionsCount()
  {
    return this.dayMetrtics.Interactions;
  }

  setInteractionsCount( value )
  {
    this.dayMetrtics.Interactions = value;
  }

  getUniquePullsAddedCount()
  {
    return this.dayMetrtics.UniquePullsAdded;
  }

  setUniquePullsAdded( value )
  {
    this.dayMetrtics.UniquePullsAdded = value;
  }
};




let day = new Day();
await day.init();
export default day;