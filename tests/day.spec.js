import Day from "../db/db_day.js";
import db from "../db/db_manager.js";


describe( "The Day class", () =>
{
  test( "connection to test database is established", async () =>
  {
    expect.assertions( 1 );
    try
    {
      await db.raw( 'Select 1+1 as result' );
    } catch ( e )
    {
      expect( e ).toEqual( {
        error: "Error connection to database",
      } );
    }
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
    expect( DAY ).toEqual( newDay );
  } );

} );
