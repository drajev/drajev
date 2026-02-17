import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import type { OctokitRepository, OctokitUser, CommitData } from '../types.js';

/**
 * Wraps Octokit and maintains connection state
 */
export class GitHubClient {
  #octokit: Octokit;
  #graphqlWithAuth: typeof graphql;
  #username: string;

  constructor(token: string, username: string) {
    this.#octokit = new Octokit({ auth: token });
    this.#graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
    this.#username = username;
  }

  get rest(): Octokit {
    return this.#octokit;
  }

  get graphql(): typeof graphql {
    return this.#graphqlWithAuth;
  }

  get user(): string {
    return this.#username;
  }

  /**
   * Fetch user info
   */
  async fetchUserInfo(): Promise<OctokitUser> {
    const { data } = await this.#octokit.users.getByUsername({
      username: this.#username,
    });

    return data as OctokitUser;
  }

  /**
   * Fetch all repositories (public + private)
   */
  async fetchRepositories(): Promise<OctokitRepository[]> {
    try {
      const repos = await this.#octokit.paginate(
        this.#octokit.repos.listForAuthenticatedUser,
        {
          per_page: 100,
          affiliation: 'owner',
          sort: 'updated',
        },
      );

      return repos;
    } catch {
      console.warn(
        '⚠️  Error fetching authenticated repos, falling back to public...',
      );
      const publicRepos = await this.#octokit.paginate(
        this.#octokit.repos.listForUser,
        {
          username: this.#username,
          per_page: 100,
          type: 'owner',
        },
      );
      return publicRepos;
    }
  }

  /**
   * Fetch repository languages
   */
  async fetchRepositoryLanguages(
    owner: string,
    repo: string,
  ): Promise<Record<string, number>> {
    const { data } = await this.#octokit.repos.listLanguages({
      owner,
      repo,
    });
    return data;
  }

  /**
   * Fetch repository details
   */
  async fetchRepository(
    owner: string,
    repo: string,
  ): Promise<OctokitRepository> {
    const { data } = await this.#octokit.repos.get({
      owner,
      repo,
    });
    return data as OctokitRepository;
  }

  /**
   * Fetch branch details
   */
  async fetchBranch(
    owner: string,
    repo: string,
    branch: string,
  ): Promise<{ commit: { sha: string } }> {
    const { data } = await this.#octokit.repos.getBranch({
      owner,
      repo,
      branch,
    });
    return data;
  }

  /**
   * Fetch commit details
   */
  async fetchCommit(
    owner: string,
    repo: string,
    commitSha: string,
  ): Promise<{ tree: { sha: string } }> {
    const { data } = await this.#octokit.git.getCommit({
      owner,
      repo,
      commit_sha: commitSha,
    });
    return data;
  }

  /**
   * Fetch Git tree
   */
  async fetchTree(
    owner: string,
    repo: string,
    treeSha: string,
    recursive = false,
  ): Promise<{ tree: Array<{ type: string; path?: string; sha?: string }> }> {
    const { data } = await this.#octokit.git.getTree({
      owner,
      repo,
      tree_sha: treeSha,
      ...(recursive && { recursive: '1' }),
    });
    return data;
  }

  /**
   * Fetch file content
   */
  async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
  ): Promise<string | null> {
    try {
      const { data } = await this.#octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in data && data.content && data.type === 'file') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status !== 404
      ) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Unknown error';
        console.warn(
          `⚠️ Error fetching ${path} for ${owner}/${repo}: ${message}`,
        );
      }
    }
    return null;
  }

  /**
   * Fetch commits from a repository
   */
  async fetchCommits(
    owner: string,
    repo: string,
    since: Date,
    until: Date,
  ): Promise<CommitData[]> {
    try {
      const commits = await this.#octokit.paginate(
        this.#octokit.repos.listCommits,
        {
          owner,
          repo,
          author: this.#username,
          since: since.toISOString(),
          until: until.toISOString(),
          per_page: 100,
        },
      );

      return commits
        .filter(commit => commit.commit.author?.date)
        .map(commit => {
          const authorDate = commit.commit.author?.date;
          if (!authorDate) {
            return null;
          }
          const commitDate = new Date(authorDate);
          return {
            date: commitDate.toISOString(),
            hour: commitDate.getUTCHours(),
            message: commit.commit.message || '',
            repository: `${owner}/${repo}`,
          };
        })
        .filter((commit): commit is CommitData => commit !== null);
    } catch {
      // Return empty array if fetch fails
      return [];
    }
  }
}
