import logger from '../src/logger'
const log = logger('comment_controller')

import { IssueComment, PullRequestReview, PullRequestReviewComment} from "@octokit/graphql-schema"

import config from '../config/config'
const { qa_team, signatures } = config

function parseComment(comment: IssueComment | PullRequestReview  | PullRequestReviewComment, pull_request_author: string): { qaed: boolean, dev_block: boolean | null, interacted: boolean }{
  return {
    qaed: isQAed(comment),
    dev_block: isDevBlocked(comment),
    interacted: isInteracted(comment,pull_request_author)
  }
}


function isQAed(comment: IssueComment | PullRequestReview  | PullRequestReviewComment): boolean {
  const regex = new RegExp(signatures.QA + signatures.emoji, 'i')
  return regex.test(comment.bodyText)
}

// Checking for dev_block or un_dev_block, otherwise return null
function isDevBlocked(comment: IssueComment | PullRequestReview  | PullRequestReviewComment): boolean | null {
  const tag = signatures.tags.find(tag => {
    const regex = new RegExp(tag.regex + signatures.emoji, 'i')
    return regex.test(comment.bodyText)
  })
  if (tag) {
    return tag.state
  }
  return null
}

function isInteracted(comment: IssueComment | PullRequestReview  | PullRequestReviewComment, pull_request_author: string): boolean {
  return qa_team.includes(comment.author?.login ?? '') && pull_request_author !== comment.author?.login
}

export { parseComment, isQAed, isDevBlocked, isInteracted}