import db from "./db_manager.js";
import date from 'date-and-time';

const defaultData = {
  Repo: '',
  PullNumber: 0,
  State: '',
  Title: '',
  HeadRef: '',
  QAReq: 1,
  CreatedAt: 0,
  UpdatedAt: 0,
  ClosedAt: 0,
  MergedAt: 0,
  Closes: null,
  Interacted: false,
  QAReady: false,
  QAReadyCount: 0,
  InteractedCount: 0
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
    this.data.Repo = github_pull.headRepository.nameWithOwner;
    this.data.PullNumber = github_pull.number;
    this.data.Title = github_pull.title;
    this.data.HeadRef = github_pull.headRefOid;
    this.data.CreatedAt = new Date( github_pull.createdAt ).getTime() / 1000;
    this.data.State = github_pull.state;
  }



  // Retrieves the Repo and Pull Number in a formatted string 
  getUniqueID()
  {
    return `${ this.data.Repo } #${ this.data.PullNumber }`;
  }

  // Retrieves the Repo Owner, Repo Name, and Pull Number
  getGraphQLValues()
  {
    let split = this.data.Repo.split( '/' );
    let repo = {
      name: split[ 1 ],
      owner: split[ 0 ]
    };
    return [ repo, this.data.PullNumber ];
  }


  async save()
  {
    try
    {
      await db( 'mod_pulls' ).insert( { ...this.data } ).onConflict( "Repo", "PullNumber" ).merge();
    } catch ( e )
    {
      console.error( "Failed to save Pull '%s %d: %s", this.data.Title, this.data.PullNumber, e.message );
    }
  }

  async setNewValues( data )
  {
    console.log( { ...data } );
    this.data = { ...data };
    await this.save();
  }

  static async getDBPulls()
  {
    const rows = await db( 'mod_pulls' ).select().where( { State: "OPEN" } );
    const db_pulls = [];

    for ( let row of rows )
    {
      db_pulls.push( new Pull( row ) );
    }
    // console.log( JSON.stringify( db_pulls, null, 2 ) );

    return db_pulls;
  }

  static getSchemaJSON()
  {
    return defaultData;
  }

  static async getQAReadyPullCount()
  {
    let result = await db( 'mod_pulls' ).count( 'QAReady as runningPullTotal' ).where( { 'QAReady': true } );
    return result[ 0 ].runningPullTotal;
  }

  static async getQAReadyUniquePullCount()
  {
    let today = new Date().getTime() / 1000;
    let result = await db( 'mod_pulls' ).count( 'QAReadyCount as runningUniquePullTotal' ).where( 'QAReadyCount', '>', 0 ).andWhere( 'CreatedAt', '>=', today );
    return result[ 0 ].runningUniquePullTotal;
  }

  static async getInteractionsCount()
  {
    let today = new Date().getTime() / 1000;
    console.log( today );
    let result = await db( 'mod_pulls' ).count( 'Interacted as Interactions' ).where( { 'Interacted': true } ).andWhere( 'UpdatedAt', '>=', today );
    console.log( result );
    return result[ 0 ].Interactions;
  }

}

