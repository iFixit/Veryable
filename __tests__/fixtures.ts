import { Commit, PullRequest, PullRequestHistory } from "@prisma/client";
import {IssueComment, PullRequest as GitHubPullRequest, PullRequestReview } from '@octokit/graphql-schema'
import CommitDB from "../db/db_commit";

export const mock_pull_request: PullRequest = {
  "repo": "iFixit/ifixit",
  "pull_number": 41780,
  "state": "OPEN",
  "title": "Tiptap: add answers preset",
  "head_ref": "7e058e9539a88c0be015ed28c8c2f6382ec90831",
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
  "head_commit_id": "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ"
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

export const mock_head_commit: Commit = {
  "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ",
  "sha": "7e058e9539a88c0be015ed28c8c2f6382ec90831",
  "qa_ready": false,
  "interacted": false,
  "dev_blocked": false,
  "qa_stamped": false,
  "ci_status": "SUCCESS",
  "committed_at": 1645559403,
  "pushed_at": 1645559437,
  "pull_request_id": "PR_kwDOACywbc4ybceJ"
}

export const mock_commits: CommitDB[] = [
  new CommitDB({
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNWQwZjNiZTA5ZDU5NmI2NGIxZmRiNDk0NWQ1MGIzNjA0NDhiMWIxNQ",
    "sha": "5d0f3be09d596b64b1fdb4945d50b360448b1b15",
    "qa_ready": false,
    "interacted": false,
    "dev_blocked": false,
    "qa_stamped": false,
    "ci_status": "SUCCESS",
    "committed_at": 1644520250,
    "pushed_at": 1644520585,
    "pull_request_id": "PR_kwDOACywbc4ybceJ"
  }),
  new CommitDB({
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoZjcwZmIzN2U4Y2QyZjM0MjgwYTM4MDMyNWZhYzUzNGQ0MGY1ZGQyYw",
    "sha": "f70fb37e8cd2f34280a380325fac534d40f5dd2c",
  "qa_ready": false,
    "interacted": false,
    "dev_blocked": false,
    "qa_stamped": false,
    "ci_status": "SUCCESS",
    "committed_at": 1644524640,
    "pushed_at": 1644524677,
    "pull_request_id": "PR_kwDOACywbc4ybceJ"
  }),
  new CommitDB({
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNzI1OGZjYmU1MGU2MzcxYWQ5NzZiYWE2YjQ2MmIzODhlMDgzNzE2NA",
    "sha": "7258fcbe50e6371ad976baa6b462b388e0837164",
"qa_ready": false,
    "interacted": false,
    "dev_blocked": false,
    "qa_stamped": false,
    "ci_status": "SUCCESS",
    "committed_at": 1644961389,
    "pushed_at": 1644962150,
    "pull_request_id": "PR_kwDOACywbc4ybceJ"
  }),
  new CommitDB({
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA",
    "sha": "613b86940c2d2f1a6f4c2990d14f6dc807cb0810",
    "qa_ready": false,
    "interacted": false,
    "dev_blocked": false,
    "qa_stamped": false,
    "ci_status": "SUCCESS",
    "committed_at": 1645145650,
    "pushed_at": 1645145672,
    "pull_request_id": "PR_kwDOACywbc4ybceJ"
  }),
  new CommitDB({
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ",
    "sha": "7e058e9539a88c0be015ed28c8c2f6382ec90831",
    "qa_ready": false,
    "interacted": false,
    "dev_blocked": false,
    "qa_stamped": false,
    "ci_status": "SUCCESS",
    "committed_at": 1645559403,
    "pushed_at": 1645559437,
    "pull_request_id": "PR_kwDOACywbc4ybceJ"
  })
]

export const mock_records: PullRequestHistory[] = [
  {
    "start_date": 1644480000,
    "date": 1644520585,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "5d0f3be09d596b64b1fdb4945d50b360448b1b15",
    "event": "qa_ready",
    "actor": "CI",
    "pull_request_event_index": 1,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNWQwZjNiZTA5ZDU5NmI2NGIxZmRiNDk0NWQ1MGIzNjA0NDhiMWIxNQ"
  },
  {
    "start_date": 1644480000,
    "date": 1644524677,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "f70fb37e8cd2f34280a380325fac534d40f5dd2c",
    "event": "qa_ready",
    "actor": "CI",
    "pull_request_event_index": 2,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoZjcwZmIzN2U4Y2QyZjM0MjgwYTM4MDMyNWZhYzUzNGQ0MGY1ZGQyYw"
  },
  {
    "start_date": 1644566400,
    "date": 1644626128,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "f70fb37e8cd2f34280a380325fac534d40f5dd2c",
    "event": "qa_stamped",
    "actor": "jordycosta",
    "pull_request_event_index": 3,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoZjcwZmIzN2U4Y2QyZjM0MjgwYTM4MDMyNWZhYzUzNGQ0MGY1ZGQyYw"
  },
  {
    "start_date": 1644566400,
    "date": 1644626128,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "f70fb37e8cd2f34280a380325fac534d40f5dd2c",
    "event": "non_qa_ready",
    "actor": "QAed",
    "pull_request_event_index": 4,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoZjcwZmIzN2U4Y2QyZjM0MjgwYTM4MDMyNWZhYzUzNGQ0MGY1ZGQyYw"
  },
  {
    "start_date": 1644566400,
    "date": 1644626128,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "f70fb37e8cd2f34280a380325fac534d40f5dd2c",
    "event": "first_interaction",
    "actor": "jordycosta",
    "pull_request_event_index": 5,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoZjcwZmIzN2U4Y2QyZjM0MjgwYTM4MDMyNWZhYzUzNGQ0MGY1ZGQyYw"
  },
  {
    "start_date": 1644912000,
    "date": 1644946315,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "f70fb37e8cd2f34280a380325fac534d40f5dd2c",
    "event": "dev_blocked",
    "actor": "jyee27",
    "pull_request_event_index": 6,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoZjcwZmIzN2U4Y2QyZjM0MjgwYTM4MDMyNWZhYzUzNGQ0MGY1ZGQyYw"
  },
  {
    "start_date": 1644912000,
    "date": 1644962197,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7258fcbe50e6371ad976baa6b462b388e0837164",
    "event": "un_dev_blocked",
    "actor": "josmfred",
    "pull_request_event_index": 7,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNzI1OGZjYmU1MGU2MzcxYWQ5NzZiYWE2YjQ2MmIzODhlMDgzNzE2NA"
  },
  {
    "start_date": 1644912000,
    "date": 1644962197,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7258fcbe50e6371ad976baa6b462b388e0837164",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 8,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNzI1OGZjYmU1MGU2MzcxYWQ5NzZiYWE2YjQ2MmIzODhlMDgzNzE2NA"
  },
  {
    "start_date": 1644912000,
    "date": 1644968888,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7258fcbe50e6371ad976baa6b462b388e0837164",
    "event": "dev_blocked",
    "actor": "jordycosta",
    "pull_request_event_index": 9,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNzI1OGZjYmU1MGU2MzcxYWQ5NzZiYWE2YjQ2MmIzODhlMDgzNzE2NA"
  },
  {
    "start_date": 1644912000,
    "date": 1644968888,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7258fcbe50e6371ad976baa6b462b388e0837164",
    "event": "non_qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 10,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNzI1OGZjYmU1MGU2MzcxYWQ5NzZiYWE2YjQ2MmIzODhlMDgzNzE2NA"
  },
  {
    "start_date": 1644912000,
    "date": 1644968888,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7258fcbe50e6371ad976baa6b462b388e0837164",
    "event": "first_interaction",
    "actor": "jordycosta",
    "pull_request_event_index": 11,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNzI1OGZjYmU1MGU2MzcxYWQ5NzZiYWE2YjQ2MmIzODhlMDgzNzE2NA"
  },
  {
    "start_date": 1645171200,
    "date": 1645214020,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "613b86940c2d2f1a6f4c2990d14f6dc807cb0810",
    "event": "un_dev_blocked",
    "actor": "josmfred",
    "pull_request_event_index": 12,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA"
  },
  {
    "start_date": 1645171200,
    "date": 1645214020,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "613b86940c2d2f1a6f4c2990d14f6dc807cb0810",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 13,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA"
  },
  {
    "start_date": 1645171200,
    "date": 1645216055,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "613b86940c2d2f1a6f4c2990d14f6dc807cb0810",
    "event": "qa_stamped",
    "actor": "jordycosta",
    "pull_request_event_index": 14,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA"
  },
  {
    "start_date": 1645171200,
    "date": 1645216055,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "613b86940c2d2f1a6f4c2990d14f6dc807cb0810",
    "event": "non_qa_ready",
    "actor": "QAed",
    "pull_request_event_index": 15,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA"
  },
  {
    "start_date": 1645171200,
    "date": 1645216055,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "613b86940c2d2f1a6f4c2990d14f6dc807cb0810",
    "event": "first_interaction",
    "actor": "jordycosta",
    "pull_request_event_index": 16,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA"
  },
  {
    "start_date": 1645516800,
    "date": 1645551685,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "613b86940c2d2f1a6f4c2990d14f6dc807cb0810",
    "event": "dev_blocked",
    "actor": "jyee27",
    "pull_request_event_index": 17,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA"
  },
  {
    "start_date": 1645516800,
    "date": 1645560114,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7e058e9539a88c0be015ed28c8c2f6382ec90831",
    "event": "un_dev_blocked",
    "actor": "josmfred",
    "pull_request_event_index": 18,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ"
  },
  {
    "start_date": 1645516800,
    "date": 1645560114,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7e058e9539a88c0be015ed28c8c2f6382ec90831",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 19,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ"
  },
  {
    "start_date": 1645689600,
    "date": 1645742441,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7e058e9539a88c0be015ed28c8c2f6382ec90831",
    "event": "qa_stamped",
    "actor": "jordycosta",
    "pull_request_event_index": 20,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ"
  },
  {
    "start_date": 1645689600,
    "date": 1645742441,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7e058e9539a88c0be015ed28c8c2f6382ec90831",
    "event": "non_qa_ready",
    "actor": "QAed",
    "pull_request_event_index": 21,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ"
  },
  {
    "start_date": 1645689600,
    "date": 1645742441,
    "pull_request_id": "PR_kwDOACywbc4yRAoi",
    "commit_sha": "7e058e9539a88c0be015ed28c8c2f6382ec90831",
    "event": "first_interaction",
    "actor": "jordycosta",
    "pull_request_event_index": 22,
    "commit_event_id": "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ"
  }
]

export const expected_updated_mock_commits = {
  PURC_lADOACywbc4ybceJ2gAoNWQwZjNiZTA5ZDU5NmI2NGIxZmRiNDk0NWQ1MGIzNjA0NDhiMWIxNQ: {
    commit: {
      commit_event_id: 'PURC_lADOACywbc4ybceJ2gAoNWQwZjNiZTA5ZDU5NmI2NGIxZmRiNDk0NWQ1MGIzNjA0NDhiMWIxNQ',
      sha: '5d0f3be09d596b64b1fdb4945d50b360448b1b15',
      qa_ready: true,
      interacted: false,
      dev_blocked: false,
      qa_stamped: false,
      ci_status: 'SUCCESS',
      committed_at: 1644520250,
      pushed_at: 1644520585,
      pull_request_id: 'PR_kwDOACywbc4ybceJ'
    }
  },
  PURC_lADOACywbc4ybceJ2gAoZjcwZmIzN2U4Y2QyZjM0MjgwYTM4MDMyNWZhYzUzNGQ0MGY1ZGQyYw: {
    commit: {
      commit_event_id: 'PURC_lADOACywbc4ybceJ2gAoZjcwZmIzN2U4Y2QyZjM0MjgwYTM4MDMyNWZhYzUzNGQ0MGY1ZGQyYw',
      sha: 'f70fb37e8cd2f34280a380325fac534d40f5dd2c',
      qa_ready: false,
      interacted: true,
      dev_blocked: true,
      qa_stamped: true,
      ci_status: 'SUCCESS',
      committed_at: 1644524640,
      pushed_at: 1644524677,
      pull_request_id: 'PR_kwDOACywbc4ybceJ'
    }
  },
  PURC_lADOACywbc4ybceJ2gAoNzI1OGZjYmU1MGU2MzcxYWQ5NzZiYWE2YjQ2MmIzODhlMDgzNzE2NA: {
    commit: {
      commit_event_id: 'PURC_lADOACywbc4ybceJ2gAoNzI1OGZjYmU1MGU2MzcxYWQ5NzZiYWE2YjQ2MmIzODhlMDgzNzE2NA',
      sha: '7258fcbe50e6371ad976baa6b462b388e0837164',
      qa_ready: false,
      interacted: true,
      dev_blocked: true,
      qa_stamped: false,
      ci_status: 'SUCCESS',
      committed_at: 1644961389,
      pushed_at: 1644962150,
      pull_request_id: 'PR_kwDOACywbc4ybceJ'
    }
  },
  PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA: {
    commit: {
      commit_event_id: 'PURC_lADOACywbc4ybceJ2gAoNjEzYjg2OTQwYzJkMmYxYTZmNGMyOTkwZDE0ZjZkYzgwN2NiMDgxMA',
      sha: '613b86940c2d2f1a6f4c2990d14f6dc807cb0810',
      qa_ready: false,
      interacted: true,
      dev_blocked: true,
      qa_stamped: true,
      ci_status: 'SUCCESS',
      committed_at: 1645145650,
      pushed_at: 1645145672,
      pull_request_id: 'PR_kwDOACywbc4ybceJ'
    }
  },
  PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ: {
    commit: {
      commit_event_id: 'PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ',
      sha: '7e058e9539a88c0be015ed28c8c2f6382ec90831',
      qa_ready: false,
      interacted: true,
      dev_blocked: false,
      qa_stamped: true,
      ci_status: 'SUCCESS',
      committed_at: 1645559403,
      pushed_at: 1645559437,
      pull_request_id: 'PR_kwDOACywbc4ybceJ'
    }
  }
}

const github_pull_request: RecursivePartial<GitHubPullRequest> = {
  closedAt: null,
  createdAt: '2022-02-08T23:02:47Z',
  headRefOid: "7e058e9539a88c0be015ed28c8c2f6382ec90831",
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
    id:  "PURC_lADOACywbc4ybceJ2gAoN2UwNThlOTUzOWE4OGMwYmUwMTVlZDI4YzhjMmY2MzgyZWM5MDgzMQ"
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


const github_review_comment: RecursivePartial<PullRequestReview> = {
  ...github_comment,
  comments: {}
}
const github_review_comment_qaed: RecursivePartial<PullRequestReview> = {
  ...github_comment_qaed,
  comments: {}
}
const github_review_comment_dev_blocked: RecursivePartial<PullRequestReview> = {
  ...github_comment_dev_blocked,
  comments: {}
}
const github_review_comment_un_dev_blocked: RecursivePartial<PullRequestReview> = {
  ...github_comment_dev_blocked,
  comments: {}
}
const github_review_comment_interacted: RecursivePartial<PullRequestReview> = {
  ...github_comment_interacted,
  comments: {}
}

const github_review_comment_threaded: RecursivePartial<PullRequestReview> = {
  ...github_review_comment,
  comments: {
    nodes: [github_comment_qaed,github_comment_dev_blocked, github_comment_un_dev_blocked]
  }
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
  },
  Review: {
    no_signatures: github_review_comment,
    qaed: github_review_comment_qaed,
    dev_blocked: github_review_comment_dev_blocked,
    un_dev_blocked: github_review_comment_un_dev_blocked,
    interacted: github_review_comment_interacted,
    qaed_dev_blocked: github_review_comment_threaded
  }
}

