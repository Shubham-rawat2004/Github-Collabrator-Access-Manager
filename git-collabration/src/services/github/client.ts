import { env } from "@/lib/env";

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  homepage: string | null;
  private: boolean;
  visibility: string;
  default_branch: string | null;
  archived: boolean;
  owner: {
    login: string;
  };
};

export type GitHubCollaborator = {
  id: number;
  login: string;
  html_url: string;
};

export type GitHubPermission = "admin" | "maintain" | "write" | "triage" | "read" | "none";

class GitHubClient {
  private readonly baseUrl = "https://api.github.com";
  private readonly token = env.GITHUB_PAT;

  private buildHeaders() {
    if (!this.token) {
      throw new Error("GITHUB_PAT is required to sync data from GitHub.");
    }

    return {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${this.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "git-collabration"
    };
  }

  private async requestJson<T>(path: string, init?: RequestInit, retryCount = 1): Promise<{ data: T; headers: Headers }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.buildHeaders(),
        ...(init?.headers ?? {})
      }
    });

    if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0" && retryCount > 0) {
      const resetAt = Number(response.headers.get("x-ratelimit-reset") ?? "0") * 1000;
      const delay = Math.max(resetAt - Date.now(), 1000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.requestJson<T>(path, init, retryCount - 1);
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`GitHub API request failed (${response.status}): ${message}`);
    }

    return {
      data: (await response.json()) as T,
      headers: response.headers
    };
  }

  async getRepositories() {
    const repositories: GitHubRepository[] = [];
    let page = 1;

    while (true) {
      const { data } = await this.requestJson<GitHubRepository[]>(
        `/user/repos?per_page=100&page=${page}&sort=updated&direction=desc`
      );

      repositories.push(...data);

      if (data.length < 100) {
        break;
      }

      page += 1;
    }

    return repositories;
  }

  async getCollaborators(owner: string, repo: string) {
    const collaborators: GitHubCollaborator[] = [];
    let page = 1;

    while (true) {
      const { data } = await this.requestJson<GitHubCollaborator[]>(
        `/repos/${owner}/${repo}/collaborators?per_page=100&page=${page}`
      );

      collaborators.push(...data);

      if (data.length < 100) {
        break;
      }

      page += 1;
    }

    return collaborators;
  }

  async getCollaboratorPermission(owner: string, repo: string, username: string) {
    const { data } = await this.requestJson<{ permission: GitHubPermission }>(
      `/repos/${owner}/${repo}/collaborators/${username}/permission`
    );

    return data.permission;
  }

  async getRepository(owner: string, repo: string) {
    const { data } = await this.requestJson<{ permissions?: { admin: boolean; [key: string]: boolean } }>(
      `/repos/${owner}/${repo}`
    );
    return data;
  }

  async getAuthenticatedUser() {
    const { data } = await this.requestJson<{ login: string }>(
      "/user"
    );
    return data;
  }

  async removeCollaborator(owner: string, repo: string, username: string) {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/collaborators/${username}`, {
      method: "DELETE",
      headers: this.buildHeaders()
    });

    if (response.status !== 204) {
      const message = await response.text();
      throw new Error(`Failed to remove collaborator: ${message}`);
    }
  }
}

export const githubClient = new GitHubClient();
