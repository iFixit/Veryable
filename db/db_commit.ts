import { Commit } from "@prisma/client";

export default class CommitDB {
  commit: Commit

   constructor (commit?: Commit) {
    this.commit = commit ? { ...commit } : {
      commit_event_id: '',
      sha: '',
      qa_ready: null,
      interacted: null,
      dev_blocked: null,
      qa_stamped: null,
      ci_status: null,
      committed_at: 0,
      pushed_at: null,
      pull_request_id: null,
    }
  }
}