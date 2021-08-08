import { jest } from "@jest/globals";
import Pull from "../db/db_pull.js";
import db from "../db/db_manager.js";

beforeAll( async () =>
{
  await db.schema
    .dropTableIfExists( 'qa_pulls' )
    .createTable( 'qa_pulls', ( table ) =>
    {
      table.string( 'repo', 100 ).notNullable();
      table.integer( 'pull_number' ).notNullable();
      table.enum( 'state', [ 'OPEN', 'CLOSED', 'MERGED' ] ).notNullable();
      table.string( 'title', 255 ).notNullable();
      table.string( 'head_ref', 40 ).notNullable();
      table.integer( 'qa_req', 1 ).defaultTo( 1 ).notNullable();
      table.integer( 'created_at' ).nullable();
      table.integer( 'updated_at' ).nullable();
      table.integer( 'closed_at' ).nullable();
      table.integer( 'merged_at' ).nullable();
      table.integer( 'closes' ).nullable();
      table.integer( 'interacted', 1 ).defaultTo( 0 ).notNullable();
      table.integer( 'interacted_count' ).defaultTo( 0 ).nullable();
      table.integer( 'qa_ready', 1 ).defaultTo( 0 ).notNullable();
      table.integer( 'qa_ready_count' ).defaultTo( 0 ).nullable();
      table.primary( [ 'repo', 'pull_number' ] );
    } );
  await db( 'qa_pulls' ).del();
} );

afterAll( async () =>
{
  await db.destroy();
} );

describe( "Pull Class", () =>
{
  test.todo( 'Confirm empty parameters for constructor uses default value' );
  test.todo( 'Confrim if you pass a github pull object, the pulls values will be init by it' );
  test.todo( ' Confirm getUniqueID works' );
  test.todo( ' Confirm getGraphQLValues works' );
  test.todo( 'Confirm setNewValues works' );
  test.todo( 'Confirm getDBPulls works' );
  test.todo( 'Confrim getSchemaJSON works' );
  test.todo( 'Confirm getQAReadyPullCount works' );
  test.todo( 'Confirm getQAReadyUniquePullCount works' );
  test.todo( 'Confirm getInteractionsCount works' );
  test.todo( 'Confirm saving works ' );
} );