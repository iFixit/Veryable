import date from "date-and-time";
import db from "./db_manager.js";

const today = date.format( new Date(), "YYYY-MM-DD" );
const yesterday = date.format( date.addDays( new Date(), -1 ), "YYYY-MM-DD" );

class Day
{
  constructor()
  {
    this.PullCount = 0;
    this.PullsAdded = 0;
  }

  // Initial the day
  async init()
  {
    let day = await db( 'qa_metrics' ).first().where( { "Date": today } ).orWhere( { "Date": yesterday } );

    if ( day )
    {
      this.PullCount = day.PullCount;
      this.PullsAdded = day.PullsAdded;
    }
    else
    {
      this.save();
    }
  };

  // Insert the new Day in the table and if it exists Update the values accordingly
  async save()
  {
    if ( today !== date.format( new Date(), "YYYY-MM-DD" ) )
    {
      yesterday = today;
      today = date.format( new Date(), "YYYY-MM-DD" );
      this.setPullsAdded( 0 );
    }
    try
    {
      await db( 'qa_metrics' )
        .insert( { "Date": today, "PullCount": this.PullCount, "PullsAdded": this.PullsAdded } )
        .onConflict( "Date" ).merge();
    } catch ( e )
    {
      console.error( "Failed to save Day " + e.message );
    }
  }

  getDayValues()
  {
    return [ this.getPullCount(), this.getPullsAdded() ];
  }

  getPullCount()
  {
    return this.PullCount;
  }

  setPullCount( value )
  {
    this.PullCount = value;
  }

  getPullsAdded()
  {
    return this.PullsAdded;
  }

  setPullsAdded( value )
  {
    this.PullsAdded = value;
  }

}


let day = new Day();
await day.init();
export default day;