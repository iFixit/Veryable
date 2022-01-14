import logger from '../src/logger'
const log = logger('comment_controller')

import { IssueComment, Maybe } from "@octokit/graphql-schema"

import config from '../config/config'
const { qa_team, signatures } = config

export function parseComment(comment: IssueComment) {
  // Check for QA Stamp
  // Check for Dev Block Stamp
  // Check for Interaction by QA Team
}


function isQAed(comment: IssueComment): boolean {
  const regex = new RegExp(signatures.QA + signatures.emoji, 'i')
  return regex.test(comment.bodyText)
}

// Only checking if dev_block or not
function isDevBlocked(comments: Maybe<IssueComment>[]): boolean {

  for (const comment of comments) {
    const tag = signatures.tags.find(tag => {
      const regex = new RegExp(tag.regex + signatures.emoji, 'i')
      return regex.test(comment?.bodyText ?? '')
    })
    if (tag) {
      return tag.state
    }
  }

  return false
}

function isInteracted(comment: IssueComment): boolean {
  return qa_team.includes(comment?.author?.login ?? '')
}