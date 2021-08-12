
export function up( knex )
{
  return knex.schema
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
    } )
    .dropTableIfExists( 'qa_metrics' )
    .createTable( 'qa_metrics', ( table ) =>
    {
      table.uuid( 'date' ).primary().notNullable();
      table.integer( 'pull_count' ).notNullable();
      table.integer( 'pulls_added' ).notNullable();
      table.integer( 'pulls_interacted' ).notNullable();
      table.integer( 'unique_pulls_added' ).notNullable();
    } );
}

export function down( knex )
{
  return knex.schema.dropTable( 'qa_pulls' ).dropTable( 'qa_metrics' );
}
