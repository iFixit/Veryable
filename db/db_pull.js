import db from "./db_manager.js";

import logger from "../logger.js";
const log = logger( 'db_pull' );

const defaultData = {
  repo: '',
  pull_number: 0,
  state: '',
  title: '',
  head_ref: '',
  qa_req: 1,
  created_at: 0,
  updated_at: 0,
  closed_at: 0,
  merged_at: 0,
  closes: null,
  interacted: false,
  interacted_count: 0,
  qa_ready: false,
  qa_ready_count: 0,
};

export default class Pull
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

  gitInit( github_pull )
  {
    this.data.repo = github_pull.headRepository.nameWithOwner;
    this.data.pull_number = github_pull.number;
    this.data.title = github_pull.title;
    this.data.head_ref = github_pull.headRefOid;
    this.data.created_at = new Date( github_pull.createdAt ).getTime() / 1000;
    this.data.state = github_pull.state;
  }

  // Retrieves the Repo and Pull Number in a formatted string 
  getUniqueID()
  {
    return `${ this.data.repo } #${ this.data.pull_number }`;
  }

  // Retrieves the Repo Owner, Repo Name, and Pull Number
  getGraphQLValues()
  {
    let split = this.data.repo.split( '/' );
    let repo = {
      name: split[ 1 ],
      owner: split[ 0 ]
    };
    return [ repo, this.data.pull_number ];
  }


  async save()
  {
    try
    {
      await db( 'qa_pulls' ).insert( { ...this.data } ).onConflict( "repo", "pull_number" ).merge();
    } catch ( e )
    {
      log.error( "Failed to save Pull #%d '%s\n\t%s", this.data.pull_number, this.data.title, new Error( e.message ) );
    }
  }

  async setNewValues( data )
  {
    this.data = { ...data };
    await this.save();
  }

  static async getDBPulls()
  {
    const rows = await db( 'qa_pulls' ).select().where( { state: "OPEN" } );
    const db_pulls = [];

    for ( let row of rows )
    {
      db_pulls.push( new Pull( row ) );
    }
    // log.data( "Pulls in the database: " + JSON.stringify( db_pulls, null, 2 ) );

    return db_pulls;
  }

  static getSchemaJSON()
  {
    return defaultData;
  }

  static async getQAReadyPullCount()
  {
    let result = await db( 'qa_pulls' ).count( 'qa_ready as running_pull_total' ).where( { 'qa_ready': true } );
    return result[ 0 ].running_pull_total;
  }

  static async getQAReadyUniquePullCount()
  {
    let today = Math.floor( new Date().setHours( 0, 0, 0, 0 ) / 1000 );
    let result = await db( 'qa_pulls' ).count( 'qa_ready_count as unique_pulls_added' ).where( 'qa_ready_count', '>', 0 ).andWhere( 'created_at', '>=', today );
    log.data( 'Get Unique Pull Count Today\'s value: ' + today );
    return result[ 0 ].unique_pulls_added;
  }

  static async getInteractionsCount()
  {
    let today = Math.floor( new Date().setHours( 0, 0, 0, 0 ) / 1000 );
    let result = await db( 'qa_pulls' ).count( 'interacted as pulls_interacted' ).where( { 'interacted': true } ).andWhere( 'updated_at', '>=', today );
    return result[ 0 ].pulls_interacted;
  }

}

