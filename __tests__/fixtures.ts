import { Commit, PullRequest, PullRequestHistory } from "@prisma/client";
import {IssueComment, PullRequest as GitHubPullRequest } from '@octokit/graphql-schema'

export const mock_pull_request: PullRequest = {
  "repo": "iFixit/ifixit",
  "pull_number": 41780,
  "state": "OPEN",
  "title": "Tiptap: add answers preset",
  "head_ref": "553464588b7b2178b6b12b27d14ff642e40d6df0",
  "qa_req": 1,
  "created_at": 1644361367,
  "updated_at": 1645642245,
  "closed_at": null,
  "merged_at": null,
  "closes": null,
  "interacted": false,
  "qa_ready": false,
  "pull_request_id": "PR_kwDOACywbc4yRAoi",
  "author": "josmfred",
  "dev_blocked": false,
  "qa_stamped": false,
  "agg_dev_block_count": 0,
  "agg_interacted_count": 0,
  "agg_qa_ready_count": 0,
  "agg_qa_stamped_count": 0,
  "head_commit_id": "PURC_lADOACywbc4yRAoi2gAoNTUzNDY0NTg4YjdiMjE3OGI2YjEyYjI3ZDE0ZmY2NDJlNDBkNmRmMA"
}

export const mock_commit: Commit = {
  commit_event_id: 'PURC_lADOACywbc4y8jV92gAoNzdkYmRkYjJkMjQxNmI5NTMyMjdlZTdiOTNkM2ZjNjNlNTQzZjU4MQ',
  sha: '77dbddb2d2416b953227ee7b93d3fc63e543f581',
  ci_status: 'SUCCESS',
  committed_at: 1644887813,
  pull_request_id: 'PR_kwDOACywbc4yRAoi',
  pushed_at: 1644887820,
  qa_ready: false,
  interacted: false,
  dev_blocked: false,
  qa_stamped: false
}

const github_pull_request: RecursivePartial<GitHubPullRequest> = {
  closedAt: null,
  createdAt: '2022-02-08T23:02:47Z',
  headRefOid: "553464588b7b2178b6b12b27d14ff642e40d6df0",
  mergedAt: null,
  number: 41780,
  state: 'OPEN',
  title: "Tiptap: add answers preset",
  updatedAt: '2022-02-23T18:50:45Z',
  id: "PR_kwDOACywbc4yRAoi"
};

const extended_github_pull_request: RecursivePartial<GitHubPullRequest> = {
  ...github_pull_request,
  author: { login: 'josmfred' },
  baseRepository: { nameWithOwner: "iFixit/ifixit" },
  headRef: {
    id: "PURC_lADOACywbc4yRAoi2gAoNTUzNDY0NTg4YjdiMjE3OGI2YjEyYjI3ZDE0ZmY2NDJlNDBkNmRmMA"
  },
}

const github_commit =  {
  id: 'PURC_lADOACywbc4y8jV92gAoNzdkYmRkYjJkMjQxNmI5NTMyMjdlZTdiOTNkM2ZjNjNlNTQzZjU4MQ',
  pr_commit: {
    oid: '77dbddb2d2416b953227ee7b93d3fc63e543f581',
    committedDate: '2022-02-15T01:16:53Z',
    pushedDate: '2022-02-15T01:17:00Z',
    status: {
      state: 'SUCCESS'
    }
  }
}

const github_commit_no_ci = {
  ...github_commit,
  pr_commit: {
    ...github_commit.pr_commit,
    status: null
  }
}

const github_commit_no_pushed_date = {
  ...github_commit,
  pr_commit: {
    ...github_commit.pr_commit,
    pushedDate: null
  }
}

const github_commit_bad_ci = {
  ...github_commit,
  pr_commit: {
    ...github_commit.pr_commit,
    status: {
      state: 'FAILURE'
    }
  }
}

const github_comment: RecursivePartial<IssueComment> = {
  id: 'IC_kwDOAldSuM46phLj',
  author: { login: 'mcTestyFace' },
  bodyText: "I don't know about this comment",
  createdAt: '2021-12-01T18:58:53Z'
}

const github_comment_qaed: RecursivePartial<IssueComment> = {
  ...github_comment,
  bodyText: 'QA 🎬\n' +
    'Creating orders with custom items:\n' +
    '\n' +
    "Doesn't trigger any exceptions\n" +
    "Don't save to the database"
}

const github_comment_dev_blocked: RecursivePartial<IssueComment> = {
  ...github_comment,
  bodyText: 'dev_block 🦚\n'
}

const github_comment_un_dev_blocked: RecursivePartial<IssueComment> = {
  ...github_comment,
  bodyText: 'Thanks for the feedback! un_dev_block ✌🏻\n'
}

const github_comment_interacted: RecursivePartial<IssueComment> = {
  ...github_comment,
  author: { login: 'ardelato'}
}

export const GitHubMocks = {
  PullRequest: {
    base: github_pull_request,
    extended: extended_github_pull_request
  },
  Commit: {
    base: github_commit,
    no_ci: github_commit_no_ci,
    no_pushed_date: github_commit_no_pushed_date,
    bad_ci: github_commit_bad_ci
  },
  Comment: {
    no_signatures: github_comment,
    qaed: github_comment_qaed,
    dev_blocked: github_comment_dev_blocked,
    un_dev_blocked: github_comment_un_dev_blocked,
    interacted: github_comment_interacted
  }
}