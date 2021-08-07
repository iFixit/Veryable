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
    expect( DAY ).toEqual( newDay );
  } );

  describe( 'test certain values are set in the database based on the Day', () =>
  {
    describe( "'today' and 'yesterday' are not in the database", () =>
    {
      test.todo( "it should init today's date with all values set to zero" );
      test.todo( "it should create a new day row with all values set to zero" );
    } );
    describe( "'today' is not in the database, but 'yesterday' is", () =>
    {
      test.todo( "it should init with today's date but the 'pull_count' will be set to 'yesterday'.'pull_count' value " );
      test.todo( "it should create a new day row with all values set to zero except for 'pull_count'" );
    } );
    describe( "'today' and 'yesterday' are in the database", () =>
    {
      test.todo( "it should init with today's date and all values from today's row in the database" );
      test.todo( "it should not creae a new entry in the database" );
      test.todo( "it should not update the database when initing" );
    } );
  } );

} );
