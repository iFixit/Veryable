import Day from "../db/db_day.js";
import db from "../db/db_manager.js";

import { jest } from '@jest/globals';

jest.mock( '../db_manger.js' );

describe( "The Day class", () =>
{
  test( "confirm all values are set to 0", () =>
  {
    let newDay = {
      dayMetrics: {
        pull_count: 0,
        pulls_added: 0,
        pulls_interacted: 0,
        unique_pulls_added: 0
      }
    };
    expect( Day ).toEqual( newDay );
  } );

  test( "validate initing", () =>
  {
    db( 'qa_metrics' ).first().where( { "date": today } ).orWhere( { "date": yesterday } ).orderBy( "date", "desc" ).mockResolvedValue( day );
  } );

} );
