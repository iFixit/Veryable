import logger from '../src/logger'
const log = logger('comment_controller')

import { Actor, Maybe, Scalars} from "@octokit/graphql-schema"

import config from '../config/config'
const { qa_team, signatures } = config

export function parseComment(comment_bodyText: Scalars['String'], comment_author: Maybe<Actor> | undefined, pull_request_author: string): { qaed: boolean, dev_block: boolean | null, interacted: boolean }{
  return {
    qaed: isQAed(comment_bodyText),
    dev_block: isDevBlocked(comment_bodyText),
    interacted: isInteracted(comment_bodyText, comment_author, pull_request_author)
  }
}


function isQAed(comment_bodyText: Scalars['String']): boolean {
  const regex = new RegExp(signatures.QA + signatures.emoji, 'i')
  return regex.test(comment_bodyText)
}

// Checking for dev_block or un_dev_block, otherwise return null
function isDevBlocked(comment_bodyText: Scalars['String']): boolean | null {
  const tag = signatures.tags.find(tag => {
    const regex = new RegExp(tag.regex + signatures.emoji, 'i')
    return regex.test(comment_bodyText)
  })
  if (tag) {
    return tag.state
  }
  return null
}

function isInteracted(comment_bodyText: Scalars['String'], comment_author: Maybe<Actor> | undefined, pull_request_author: string): boolean {
  return qa_team.includes(comment_author?.login ?? '') && pull_request_author !== comment_author?.login
}