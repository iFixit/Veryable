import { Commit, PullRequest, PullRequestHistory } from "@prisma/client";
import {IssueComment, PullRequest as GitHubPullRequest, PullRequestReview } from '@octokit/graphql-schema'
import CommitDB from "../db/db_commit";

export const interactions = [
  { start_date: 1622012400, _count: { event: 1 } },
  { start_date: 1622185200, _count: { event: 1 } },
  { start_date: 1622703600, _count: { event: 5 } },
  { start_date: 1623049200, _count: { event: 1 } },
  { start_date: 1623394800, _count: { event: 3 } },
  { start_date: 1623654000, _count: { event: 1 } },
  { start_date: 1623740400, _count: { event: 2 } },
  { start_date: 1623826800, _count: { event: 1 } },
]

export const interaction_day_counts = {
  '1622012400': {
    metrics: {
      date: 1622012400,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 1,
      unique_pulls_added: 0
    }
  },
  '1622185200': {
    metrics: {
      date: 1622185200,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 1,
      unique_pulls_added: 0
    }
  },
  '1622703600':  {
    metrics: {
      date: 1622703600,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 5,
      unique_pulls_added: 0
    }
  },
  '1623049200':  {
    metrics: {
      date: 1623049200,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 1,
      unique_pulls_added: 0
    }
  },
  '1623394800':  {
    metrics: {
      date: 1623394800,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 3,
      unique_pulls_added: 0
    }
  },
  '1623654000':  {
    metrics: {
      date: 1623654000,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 1,
      unique_pulls_added: 0
    }
  },
  '1623740400':  {
    metrics: {
      date: 1623740400,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 2,
      unique_pulls_added: 0
    }
  },
  '1623826800':  {
    metrics: {
      date: 1623826800,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 1,
      unique_pulls_added: 0
    }
  }
}

export const unique_pulls_added: PullRequestHistory[] =  [
  {
    start_date: 1524121200,
    date: 1524179989,
    pull_request_id: 'MDExOlB1bGxSZXF1ZXN0MTgyOTIzMjMw',
    commit_sha: '8bdbc9f4156036003fb5240837b1509f31fc01b5',
    event: 'qa_ready',
    actor: 'CI',
    pull_request_event_index: 1,
    commit_event_id: 'MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MTgyOTIzMjMwOjhiZGJjOWY0MTU2MDM2MDAzZmI1MjQwODM3YjE1MDlmMzFmYzAxYjU='
  },
  {
    start_date: 1528268400,
    date: 1528308457,
    pull_request_id: 'MDExOlB1bGxSZXF1ZXN0MTkzMDk1OTg3',
    commit_sha: 'c82605632f40c858ed3c786e326770f7cb6eff3e',
    event: 'qa_ready',
    actor: 'CI',
    pull_request_event_index: 1,
    commit_event_id: 'MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MTkzMDk1OTg3OmM4MjYwNTYzMmY0MGM4NThlZDNjNzg2ZTMyNjc3MGY3Y2I2ZWZmM2U='
  },
  {
    start_date: 1528354800,
    date: 1528405395,
    pull_request_id: 'MDExOlB1bGxSZXF1ZXN0MTkzNDUyMTA1',
    commit_sha: 'e3cb5f62edd0217a790cd33f33bfd86cce522b4e',
    event: 'qa_ready',
    actor: 'CI',
    pull_request_event_index: 1,
    commit_event_id: 'MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MTkzNDUyMTA1OmUzY2I1ZjYyZWRkMDIxN2E3OTBjZDMzZjMzYmZkODZjY2U1MjJiNGU='
  },
  {
    start_date: 1528354800,
    date: 1528416112,
    pull_request_id: 'MDExOlB1bGxSZXF1ZXN0MTkzNDc4OTEw',
    commit_sha: 'b9780517ff61cf8ef620e6b6f912b84deee9f4e5',
    event: 'qa_ready',
    actor: 'CI',
    pull_request_event_index: 1,
    commit_event_id: 'MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MTkzNDc4OTEwOmI5NzgwNTE3ZmY2MWNmOGVmNjIwZTZiNmY5MTJiODRkZWVlOWY0ZTU='
  },
  {
    start_date: 1529391600,
    date: 1529430823,
    pull_request_id: 'MDExOlB1bGxSZXF1ZXN0MTk1OTA5ODYz',
    commit_sha: '1ddf7e3172ba7ade33d2d231b2e4924436901619',
    event: 'qa_ready',
    actor: 'CI',
    pull_request_event_index: 1,
    commit_event_id: 'MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MTk1OTA5ODYzOjFkZGY3ZTMxNzJiYTdhZGUzM2QyZDIzMWIyZTQ5MjQ0MzY5MDE2MTk='
  },
  {
    start_date: 1529391600,
    date: 1529449585,
    pull_request_id: 'MDExOlB1bGxSZXF1ZXN0MTk1OTgyMTY2',
    commit_sha: '15f30d8951c7b0f0e978b1f4906f924dbd52da36',
    event: 'qa_ready',
    actor: 'CI',
    pull_request_event_index: 1,
    commit_event_id: 'MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MTk1OTgyMTY2OjE1ZjMwZDg5NTFjN2IwZjBlOTc4YjFmNDkwNmY5MjRkYmQ1MmRhMzY='
  },
  {
    start_date: 1529391600,
    date: 1529449585,
    pull_request_id: 'MDExOlB1bGxSZXF1ZXN0MjAyMDgzMTIz',
    commit_sha: 'a599fa3434e2c868c74ab8326b01a97416acdb1a',
    event: 'qa_ready',
    actor: 'CI',
    pull_request_event_index: 1,
    commit_event_id: 'MDE3OlB1bGxSZXF1ZXN0Q29tbWl0MjAyMDgzMTIzOmE1OTlmYTM0MzRlMmM4NjhjNzRhYjgzMjZiMDFhOTc0MTZhY2RiMWE='
  },
]
export const unique_pulls_added_counts = {
  '1524121200': {
    metrics: {
      date: 1524121200,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 1
    }
  },
  '1528268400': {
    metrics: {
      date: 1528268400,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 1
    }
  },
  '1528354800':  {
    metrics: {
      date: 1528354800,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 2
    }
  },
  '1529391600':  {
    metrics: {
      date: 1529391600,
      pull_count: 0,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 3
    }
  }
}

export const pulls_added = [
  { start_date: 1519459200, _count: { event: 4 } },
  { start_date: 1519632000, _count: { event: 9 } },
  { start_date: 1519718400, _count: { event: 7 } },
  { start_date: 1519804800, _count: { event: 2 } },
  { start_date: 1519891200, _count: { event: 4 } }
]

export const pulls_added_counts = {
  '1519459200': {
    metrics: {
      date: 1519459200,
      pull_count: 0,
      pulls_added: 4,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  '1519632000': {
    metrics: {
      date: 1519632000,
      pull_count: 0,
      pulls_added: 9,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  '1519718400':  {
    metrics: {
      date: 1519718400,
      pull_count: 0,
      pulls_added: 7,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  '1519804800':  {
    metrics: {
      date: 1519804800,
      pull_count: 0,
      pulls_added: 2,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  '1519891200':  {
    metrics: {
      date: 1519891200,
      pull_count: 0,
      pulls_added: 4,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  }
}

export const pull_counts: PullRequestHistory[] = [
  {
    "start_date": 1645747200,
    "date": 1645828038,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "44ea63990e779de858befae2aa301c8df18395e0",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 41,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNDRlYTYzOTkwZTc3OWRlODU4YmVmYWUyYWEzMDFjOGRmMTgzOTVlMA"
  },
  {
    "start_date": 1646006400,
    "date": 1646084665,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "44ea63990e779de858befae2aa301c8df18395e0",
    "event": "non_qa_ready",
    "actor": "QAed",
    "pull_request_event_index": 43,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNDRlYTYzOTkwZTc3OWRlODU4YmVmYWUyYWEzMDFjOGRmMTgzOTVlMA"
  },
  {
    "start_date": 1646265600,
    "date": 1646336053,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "bba7ce142ad6c41ec5521571329bb395a4890bb9",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 49,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoYmJhN2NlMTQyYWQ2YzQxZWM1NTIxNTcxMzI5YmIzOTVhNDg5MGJiOQ"
  },
  {
    "start_date": 1646611200,
    "date": 1646680461,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "e1f8a9a006c402d9efd6d42f0ea2d25fcd9dd74b",
    "event": "qa_ready",
    "actor": "CI",
    "pull_request_event_index": 50,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoZTFmOGE5YTAwNmM0MDJkOWVmZDZkNDJmMGVhMmQyNWZjZDlkZDc0Yg"
  }
]

export const pull_events: PullRequestHistory[] = [
  {
    "start_date": 1643932800,
    "date": 1644018333,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "50539e13ba86ddaf2759069af8c00fffe03a0b86",
    "event": "qa_ready",
    "actor": "CI",
    "pull_request_event_index": 1,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNTA1MzllMTNiYTg2ZGRhZjI3NTkwNjlhZjhjMDBmZmZlMDNhMGI4Ng"
  },
  {
    "start_date": 1644019200,
    "date": 1644029765,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "50539e13ba86ddaf2759069af8c00fffe03a0b86",
    "event": "non_qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 3,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNTA1MzllMTNiYTg2ZGRhZjI3NTkwNjlhZjhjMDBmZmZlMDNhMGI4Ng"
  },
  {
    "start_date": 1644019200,
    "date": 1644042386,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "fecfb3ad53096814742412219ade734c332710cd",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 5,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoZmVjZmIzYWQ1MzA5NjgxNDc0MjQxMjIxOWFkZTczNGMzMzI3MTBjZA"
  },
  {
    "start_date": 1644192000,
    "date": 1644269461,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "fecfb3ad53096814742412219ade734c332710cd",
    "event": "non_qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 7,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoZmVjZmIzYWQ1MzA5NjgxNDc0MjQxMjIxOWFkZTczNGMzMzI3MTBjZA"
  },
  {
    "start_date": 1644192000,
    "date": 1644272849,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "13622aa53ea9301f96401064dd6f9beadd0d3ab5",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 10,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoMTM2MjJhYTUzZWE5MzAxZjk2NDAxMDY0ZGQ2ZjliZWFkZDBkM2FiNQ"
  },
  {
    "start_date": 1644192000,
    "date": 1644273313,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "13622aa53ea9301f96401064dd6f9beadd0d3ab5",
    "event": "non_qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 12,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoMTM2MjJhYTUzZWE5MzAxZjk2NDAxMDY0ZGQ2ZjliZWFkZDBkM2FiNQ"
  },
  {
    "start_date": 1644192000,
    "date": 1644275837,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "f675f5d93c325a3daf3b6fea3427ad935f94232f",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 14,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoZjY3NWY1ZDkzYzMyNWEzZGFmM2I2ZmVhMzQyN2FkOTM1Zjk0MjMyZg"
  },
  {
    "start_date": 1644278400,
    "date": 1644284129,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "f675f5d93c325a3daf3b6fea3427ad935f94232f",
    "event": "non_qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 17,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoZjY3NWY1ZDkzYzMyNWEzZGFmM2I2ZmVhMzQyN2FkOTM1Zjk0MjMyZg"
  },
  {
    "start_date": 1644364800,
    "date": 1644434349,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "f675f5d93c325a3daf3b6fea3427ad935f94232f",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 20,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoZjY3NWY1ZDkzYzMyNWEzZGFmM2I2ZmVhMzQyN2FkOTM1Zjk0MjMyZg"
  },
  {
    "start_date": 1644364800,
    "date": 1644445780,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "f675f5d93c325a3daf3b6fea3427ad935f94232f",
    "event": "non_qa_ready",
    "actor": "QAed",
    "pull_request_event_index": 23,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoZjY3NWY1ZDkzYzMyNWEzZGFmM2I2ZmVhMzQyN2FkOTM1Zjk0MjMyZg"
  },
  {
    "start_date": 1644451200,
    "date": 1644522170,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "9f5468ff018d2fa454c1407d0f740f002135cfba",
    "event": "qa_ready",
    "actor": "CI",
    "pull_request_event_index": 25,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoOWY1NDY4ZmYwMThkMmZhNDU0YzE0MDdkMGY3NDBmMDAyMTM1Y2ZiYQ"
  },
  {
    "start_date": 1644451200,
    "date": 1644528154,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "9f5468ff018d2fa454c1407d0f740f002135cfba",
    "event": "non_qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 27,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoOWY1NDY4ZmYwMThkMmZhNDU0YzE0MDdkMGY3NDBmMDAyMTM1Y2ZiYQ"
  },
  {
    "start_date": 1644969600,
    "date": 1644974156,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "50d079c884f47842da592a372a700ce4a63f9d2b",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 29,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNTBkMDc5Yzg4NGY0Nzg0MmRhNTkyYTM3MmE3MDBjZTRhNjNmOWQyYg"
  },
  {
    "start_date": 1644969600,
    "date": 1645052172,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "50d079c884f47842da592a372a700ce4a63f9d2b",
    "event": "non_qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 32,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNTBkMDc5Yzg4NGY0Nzg0MmRhNTkyYTM3MmE3MDBjZTRhNjNmOWQyYg"
  },
  {
    "start_date": 1645488000,
    "date": 1645572354,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "50d079c884f47842da592a372a700ce4a63f9d2b",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 35,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNTBkMDc5Yzg4NGY0Nzg0MmRhNTkyYTM3MmE3MDBjZTRhNjNmOWQyYg"
  },
  {
    "start_date": 1645574400,
    "date": 1645639760,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "5e1c5c0d495f68f1afa291db87f47f083de80fa3",
    "event": "qa_ready",
    "actor": "CI",
    "pull_request_event_index": 36,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNWUxYzVjMGQ0OTVmNjhmMWFmYTI5MWRiODdmNDdmMDgzZGU4MGZhMw"
  },
  {
    "start_date": 1645660800,
    "date": 1645661387,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "5e1c5c0d495f68f1afa291db87f47f083de80fa3",
    "event": "non_qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 38,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNWUxYzVjMGQ0OTVmNjhmMWFmYTI5MWRiODdmNDdmMDgzZGU4MGZhMw"
  },
  {
    "start_date": 1645747200,
    "date": 1645828038,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "44ea63990e779de858befae2aa301c8df18395e0",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 41,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNDRlYTYzOTkwZTc3OWRlODU4YmVmYWUyYWEzMDFjOGRmMTgzOTVlMA"
  },
  {
    "start_date": 1646006400,
    "date": 1646084665,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "44ea63990e779de858befae2aa301c8df18395e0",
    "event": "non_qa_ready",
    "actor": "QAed",
    "pull_request_event_index": 43,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoNDRlYTYzOTkwZTc3OWRlODU4YmVmYWUyYWEzMDFjOGRmMTgzOTVlMA"
  },
  {
    "start_date": 1646265600,
    "date": 1646336053,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "bba7ce142ad6c41ec5521571329bb395a4890bb9",
    "event": "qa_ready",
    "actor": "dev block change",
    "pull_request_event_index": 49,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoYmJhN2NlMTQyYWQ2YzQxZWM1NTIxNTcxMzI5YmIzOTVhNDg5MGJiOQ"
  },
  {
    "start_date": 1646611200,
    "date": 1646680461,
    "pull_request_id": "PR_kwDOC4j6N84yHA5p",
    "commit_sha": "e1f8a9a006c402d9efd6d42f0ea2d25fcd9dd74b",
    "event": "qa_ready",
    "actor": "CI",
    "pull_request_event_index": 50,
    "commit_event_id": "PURC_lADOC4j6N84yHA5p2gAoZTFmOGE5YTAwNmM0MDJkOWVmZDZkNDJmMGVhMmQyNWZjZDlkZDc0Yg"
  }
]

export const pull_counts_counts = {
  "1645747200": {
    metrics: {
      date: 1645747200,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  "1645833600": {
    metrics: {
      date: 1645833600,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  "1645920000": {
    metrics: {
      date: 1645920000,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  "1646265600": {
    metrics: {
      date: 1646265600,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  "1646352000": {
    metrics: {
      date: 1646352000,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  "1646438400": {
    metrics: {
      date: 1646438400,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  "1646524800": {
    metrics: {
      date: 1646524800,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  "1646611200": {
    metrics: {
      date: 1646611200,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  },
  "1646697600": {
    metrics: {
      date: 1646697600,
      pull_count: 1,
      pulls_added: 0,
      pulls_interacted: 0,
      unique_pulls_added: 0
    }
  }
}

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

