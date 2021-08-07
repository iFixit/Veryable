import Day from '../db/db_day';

// @ponicode
describe( "init", () =>
{
  let inst;

  beforeEach( () =>
  {
    inst = new Day();
  } );

  test( "validate default values", async () =>
  {
    expect( inst ).toEqual( { dayMetrics: { pull_count: 0, pulls_added: 0, pulls_interacted: 0, unique_pulls_added: 0 } } );
  } );
} );
