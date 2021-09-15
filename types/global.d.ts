declare interface Commit{
  commit: {
    pushedDate: string
    status: {
      state: string
    }
  }
}

declare interface GitHubPullRequest{
  bodyText?: string,
  closedAt: null | string,
  comments?: {
    nodes: {
      author: {
        login: string;
      }
      createdAt: string;
      bodyText: string;
    }[]
  },
  commits?: {
    nodes: Commit[]
  },
  createdAt: string,
  headRefOid: string,
  baseRepository: {
    nameWithOwner: string;
  },
  mergedAt: null | string,
  number: number,
  state: string,
  title: string,
  updatedAt: string,
}

declare interface GitHubRepositoryPulls{
  repository: {
    pullRequests: {
      totalcount: number,
      nodes: GitHubPullRequest[]
    }
  }
}

declare interface GitHubRepositorySinglePull{
  repository: {
    pullRequest: GitHubPullRequest
  }
}
