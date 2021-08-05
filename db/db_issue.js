import db from "./db_manager.js";

import logger from "../logger.js";
const log = logger( 'db_issue' );

const defaultData = {
  repo: '',
  issue_number: 0,
  state: '',
  title: '',
  created_at: 0,
  closed_at: 0,
  author: '',
  labels: {}
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

  gitInit(github_issue){
    this.data.repo = github_issue.repository.nameWithOwner;
    this.data.issue_number = github_issue.number;
    this.data.title = github_issue.title;
  }


  async save()
  {
    try
    {
      await db( 'qa_issues' ).insert( { ...this.data } ).onConflict( "repo", "issue_number" ).merge();
    } catch ( e )
    {
      log.error( "Failed to save Issue '%s %d: %s", this.data.title, this.data.issue_number, e.message );
    }
  }

  getUniqueID()
  {
    return `${ this.data.repo } #${ this.data.issue_number }`;
  }

  async setNewValues( data )
  {
    this.data = { ...data };
    await this.save();
  }

  static async getAllDBIssues()
  {
    const rows = await db( 'qa_issues' ).select().whereNull( 'author' );
    const db_issues = [];

    for ( let row of rows )
    {
      db_issues.push( new Issue( row ) );
    }
    // log.data( "Issues in the database: " + JSON.stringify( db_issues, null, 2 ) );

    return db_issues;
  }

  // Retrieves the repo Owner, repo Name, and Issue Number
  getGraphQLValues()
  {
    let split = this.data.repo.split( '/' );
    let repo = {
      name: split[ 1 ],
      owner: split[ 0 ]
    };
    return [ repo, this.data.issue_number ];
  }

  static getSchemaJSON()
  {
    return defaultData;
  }


}