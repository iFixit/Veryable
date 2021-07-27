import db from "./db_manager.js";

const defaultData = {
  Repo: '',
  IssueNumber: 0,
  State: '',
  Title: '',
  CreatedAt: 0,
  ClosedAt: 0,
  Author: '',
  Labels: {}
};

export default class Issue
{
  constructor( data )
  {
    if ( data )
    {
      this.data = { ...data };
    } else
    {
      this.data = {
        ...defaultData
      };
    }
  }

  async save()
  {
    try
    {
      await db( 'mod_issues' ).insert( { ...this.data } ).onConflict( "Repo", "IssueNumber" ).merge();
    } catch ( e )
    {
      console.error( "Failed to save Issue '%s %d: %s", this.data.Title, this.data.IssueNumber, e.message );
    }
  }

  async setNewValues( data )
  {
    this.data = { ...data };
    await this.save();
  }

  static async getAllDBIssues()
  {
    const rows = await db( 'mod_issues' ).select().whereNull( 'Author' ).whereIn( 'Repo', [ 'iFixit/server-templates', 'iFixit/ifixit' ] );
    const db_issues = [];
    console.log( rows.length );

    for ( let row of rows )
    {
      db_issues.push( new Issue( row ) );
    }

    return db_issues;
  }

  // Retrieves the Repo Owner, Repo Name, and Issue Number
  getGraphQLValues()
  {
    let split = this.data.Repo.split( '/' );
    let repo = {
      name: split[ 1 ],
      owner: split[ 0 ]
    };
    return [ repo, this.data.IssueNumber ];
  }

  static getSchemaJSON()
  {
    return defaultData;
  }
}