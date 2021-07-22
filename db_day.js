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
    this.init();
  }

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

  async save()
  {
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

setTimeout( () => console.log( day ), 1000 );