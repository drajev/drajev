export interface GitHubStats {
  username: string;
  userId: number;
  periodStart: string;
  periodEnd: string;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number;
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  contributedTo: number;
  followers: number;
  following: number;
  streak: StreakInfo;
  languages: LanguageStats[];
  contributionGraph: ContributionDay[];
  topRepos: RepoInfo[];
  avgCommitsPerDay: number;
  contributionPercentages: {
    commits: number;
    prs: number;
    reviews: number;
    issues: number;
  };
  commitData: CommitData[];
  productivityStats: ProductivityStats;
  repoActivity: RepoActivity[];
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}

export interface LanguageStats {
  name: string;
  color: string;
  percentage: number;
  size: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RepoInfo {
  name: string;
  stars: number;
  forks: number;
  description: string;
  language: string;
}

export interface UserContributions {
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalRepositoryContributions: number;
  totalRepositoriesWithContributedCommits: number;
  restrictedContributionsCount: number;
  contributionCalendar: {
    totalContributions: number;
    weeks: {
      contributionDays: {
        date: string;
        contributionCount: number;
        contributionLevel: string;
      }[];
    }[];
  };
}

export interface GraphQLContributionsResponse {
  user: {
    contributionsCollection: UserContributions;
  };
}

export interface GraphQLRepoListResponse {
  user: {
    repositories: {
      nodes: {
        name: string;
        owner: {
          login: string;
        };
        isPrivate: boolean;
      }[];
    };
  };
}

export interface GraphQLDetailedContributionsResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalRepositoryContributions: number;
      restrictedContributionsCount: number;
      commitContributionsByRepository: {
        repository: {
          name: string;
          owner: {
            login: string;
          };
          isPrivate: boolean;
        };
        contributions: {
          totalCount: number;
        };
      }[];
      issueContributionsByRepository: {
        repository: {
          name: string;
          owner: {
            login: string;
          };
          isPrivate: boolean;
        };
        contributions: {
          totalCount: number;
        };
      }[];
      pullRequestContributionsByRepository: {
        repository: {
          name: string;
          owner: {
            login: string;
          };
          isPrivate: boolean;
        };
        contributions: {
          totalCount: number;
        };
      }[];
    };
  };
}

export interface OctokitRepository {
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  private: boolean;
  language?: string | null;
  size?: number;
  stargazers_count?: number;
  forks_count?: number;
  description?: string | null;
  fork?: boolean;
  default_branch?: string;
}

export interface OctokitUser {
  id: number;
  public_repos: number;
  total_private_repos?: number;
  followers: number;
  following: number;
}

export interface CommitData {
  date: string; // ISO date string
  hour: number; // 0-23
  message: string;
  repository: string; // repo full name
}

export interface ProductivityStats {
  hourlyDistribution: number[]; // 24-element array
  commitTypes: Record<string, number>; // feat, fix, docs, etc.
}

export interface RepoActivity {
  name: string;
  commits: number;
  activityOverTime: number[]; // Daily commit counts for last 30 days
}
