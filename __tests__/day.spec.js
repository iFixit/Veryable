import { jest } from "@jest/globals";
import Day from "../db/db_day.js";
import db from "../db/db_manager.js";

beforeAll( async () =>
{
  await db.schema
    .dropTableIfExists( 'qa_metrics' )
    .createTable( 'qa_metrics', ( table ) =>
    {
      table.uuid( 'date' ).primary().notNullable();
      table.integer( 'pull_count' ).notNullable();
      table.integer( 'pulls_added' ).notNullable();
      table.integer( 'pulls_interacted' ).notNullable();
      table.integer( 'unique_pulls_added' ).notNullable();
    } );
  await db( 'qa_metrics' ).del();
} );

describe( "Day Class", () =>
{
  test( "Connection Established", async () =>
  {
    let data = await db.raw( 'Select 1+1 as result' );
    expect( data[ 0 ] ).toContainEqual( {
      result: 2
    } );

  } );

  describe( 'Day Value Conditions', () =>
  {
    describe( "'today' and 'yesterday' are not in the database", () =>
    {
      test( 'should have no values in the database', async () =>
      {
        let data = await db( 'qa_metrics' ).select();
        expect( data.length ).toBe( 0 );
      } );

      test( "should init today's date with all values set to zero", async () =>
      {
        let newDay = {
          pull_count: 0,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0
        };
        let DAY = new Day();
        let spy = jest.spyOn( DAY, 'save' ).mockImplementation( () => { 'Saving to DB'; } );

        await DAY.init();
        let dayValues = DAY.getDayValues();
        expect( dayValues ).toMatchObject( newDay );

        expect( spy ).toHaveBeenCalled();

        let data = await db( 'qa_metrics' ).select();
        //Should not have saved to the database just yet
        expect( data.length ).toBe( 0 );

        spy.mockRestore();
      } );

      test( "should create a new day row with all values set to zero", async () =>
      {
        let newDay = {
          pull_count: 0,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0
        };
        let DAY = new Day();
        await DAY.init();

        let data = await db( 'qa_metrics' ).select();
        expect( data.length ).toBe( 1 );
        expect( data[ 0 ] ).toMatchObject( newDay );
      } );
    } );

    describe( "'today' is not in the database, but 'yesterday' is", () =>
    {
      beforeEach( async () =>
      {
        await db( 'qa_metrics' ).del();
        await db( 'qa_metrics' ).insert( [
          {
            "date": 1627974000, //Tue Aug 03 00:00:00 -0700 2021
            "pull_count": 12,
            "pulls_added": 49,
            "pulls_interacted": 15,
            "unique_pulls_added": 4
          }
        ] );

        // Mocking the dates it will be set to for today and yesteday; returning [Wed Aug 04 00:00:00 -0700 2021, Tue Aug 03 00:00:00 -0700 2021]
        jest.spyOn( Day.prototype, "getDates" ).mockImplementation( () => [ 1628060400, 1627974000 ] );

        // Mocking save since it checks today against a dynamic value 
        // jest.spyOn( Day.prototype, "save" ).mockImplementation( ( newMetrics ) =>
        // {
        //   // if ( today !== Math.floor( new Date().setHours( 0, 0, 0, 0 ) / 1000 ) )
        //   // {
        //   //   [ today, yesterday ] = getDates();
        //   //   this.setPullsAdded( 0 );
        //   // }
        //   this.dayMetrics = newMetrics ? newMetrics : this.dayMetrics;
        //   try
        //   {
        //     await db( 'qa_metrics' )
        //       .insert( { "date": today, ...this.dayMetrics } )
        //       .onConflict( "date" ).merge();
        //   } catch ( e )
        //   {
        //     log.error( "Failed to save Day " + e.message );
        //   }
        // } );
      } );

      afterEach( () =>
      {
        jest.restoreAllMocks();
      } );

      test( "should init with today's date but the 'pull_count' will be set to 'yesterday'.'pull_count' value ", async () =>
      {
        let newDayWithYesterday = {
          pull_count: 12,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0
        };
        let DAY = new Day();
        let spy = jest.spyOn( DAY, 'save' ).mockImplementation( () => { 'Saving to DB'; } );

        await DAY.init();
        let dayValues = DAY.getDayValues();
        expect( dayValues ).toMatchObject( newDayWithYesterday );

        expect( spy ).toHaveBeenCalledTimes( 0 );
        let data = await db( 'qa_metrics' ).select();
        //Should not have saved a new row to the database just yet
        expect( data.length ).toBe( 1 );
        spy.mockRestore();
      } );
      test( "should create a new day row with all values set to zero except for 'pull_count'", async () =>
      {
        let newDayWithYesterday = {
          pull_count: 12,
          pulls_added: 0,
          pulls_interacted: 0,
          unique_pulls_added: 0
        };
        let DAY = new Day();

        await DAY.init();
        let dayValues = DAY.getDayValues();
        expect( dayValues ).toMatchObject( newDayWithYesterday );
        console.log( DAY );
        await DAY.save();

        let data = await db( 'qa_metrics' ).select().orderBy( 'date', 'desc' );
        //Should not have saved a new row to the database just yet
        console.log( data );

        expect( data.length ).toBe( 2 );
        console.log( data );
        // expect.toMatchObject( newDayWithYesterday );

      } );
    } );
    describe( "'today' and 'yesterday' are in the database", () =>
    {
      test.todo( "it should init with today's date and all values from today's row in the database" );
      test.todo( "it should not creae a new entry in the database" );
      test.todo( "it should not update the database when initing" );
    } );
  } );
  // test( "confirm all values are set to 0", async () =>
  // {
  //   let newDay = {
  //     dayMetrics: {
  //       pull_count: 0,
  //       pulls_added: 0,
  //       pulls_interacted: 0,
  //       unique_pulls_added: 0
  //     }
  //   };
  //   let DAY = new Day();
  //   await DAY.init();
  //   console.log( mockSave.mock );
  // } );
} );