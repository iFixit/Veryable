import Day from "../db/db_day.js";
import db from "../db/db_manager.js";


describe( "The Day class", () =>
{
  test( "connection to test database is established", async () =>
  {
    let data = await db.raw( 'Select 1+1 as result' );
    expect( data[ 0 ] ).toContainEqual( { result: 2 } );

  } );

  test( "confirm all values are set to 0", async () =>
  {
    let newDay = {
      dayMetrics: {
        pull_count: 0,
        pulls_added: 0,
        pulls_interacted: 0,
        unique_pulls_added: 0
      }
    };
    let DAY = new Day();
    await DAY.init();
    console.log( DAY );
    expect( DAY ).toEqual( newDay );
  } );

} );
