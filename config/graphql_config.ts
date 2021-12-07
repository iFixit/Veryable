export default {
  GET_OPEN_PULLS: ( repo: string, owner: string, limitsize: number ) => `
    {
        repository(name: "${ repo }", owner: "${ owner }") {
            pullRequests(states: OPEN, first: ${ limitsize }, orderBy: {field: CREATED_AT, direction: DESC} ) {
                totalCount,
                nodes {
                   ${ PULL_INFO }
                }
            }
        }
    }
    ${ COMMENT_FRAGMENT }
  `,
  GET_PULL: ( repo: string, owner: string, pullNumber: number ) => `
    {
        repository(name: "${ repo }", owner: "${ owner }") {
            pullRequest(number: ${ pullNumber }) {
                ${ PULL_INFO }
            }
        }
    }
    ${ COMMENT_FRAGMENT }
  `,
  GET_DAY_ISSUES: ( repo: string, owner: string, limitsize: number, day: string) => `
  {
      repository(name: "${ repo }", owner: "${ owner }") {
        issues(first: ${ limitsize }, orderBy: { field: CREATED_AT, direction: DESC }, filterBy: { since: "${ day }", labels: [ "0 bug" ]}) {
          nodes{
            ${ ISSUE_INFO }
          }
        }
      }
    }
  `,
  GET_ISSUES: ( repo: string, owner: string, cursor:string | null = null ) => `
  {
    repository(name: "${ repo }", owner: "${ owner }") {
      issues(first: 100,  orderBy: { field: CREATED_AT, direction: DESC }, ${ cursor !== null ? 'after:"' + cursor + '"' : ''
    }) {
        pageInfo{
          endCursor
          hasNextPage
        }
        nodes{
          ${ ISSUE_INFO }
        }
      }
    }
  }
  `,
  GET_ISSUE: ( repo: string, owner: string, issueNumber: number ) => `
  {
  repository( name: "${ repo }", owner: "${ owner }" ) {
    issue( number: ${ issueNumber } ) {
      ${ ISSUE_INFO }
    }
  }
}
`,
};

/* Strucutre
 * @state => Pull Status (OPEN, CLOSED, MERGED)
 * @bodyText => Pull Description (Holds the qa_req_# argument)
 * @commits => Pull commits array (has date commit was made and build status--i.e. CI status)
 * @comments => Pull comments array (has up to the latest 50 comments from a pull)
 */
const PULL_INFO = `
id
state,
title,
number,
baseRepository{
  nameWithOwner
}
headRefOid,
bodyText,
createdAt,
updatedAt
closedAt,
mergedAt,
commits( last: 1 ){
  nodes{
    commit{
      pushedDate,
      status{
        state
      }
    }
  }
},
comments( last: 50, orderBy: { field: UPDATED_AT, direction: DESC } ){
  nodes{
    ...commentFields
  }
},
`;

const ISSUE_INFO = `
state
author{
  login
}
createdAt
closedAt
title
number
repository{
  nameWithOwner
}
labels( first: 10 ){
  nodes{
    name
  }
}
`;

const COMMENT_FRAGMENT = `
fragment commentFields on Comment {
  author{
    login
  }
  createdAt
  bodyText
} `;
