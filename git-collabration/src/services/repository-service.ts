import { fetchBackend } from "@/lib/backend";
import { Repository, RepositoryAccess, GithubUser, Employee } from "@prisma/client";

export type RepositoryVisibilityFilter = "all" | "public" | "private";

export type RepositoryAccessWithUser = RepositoryAccess & {
  githubUser: GithubUser;
};

export type RepositoryWithAccessAndUser = Repository & {
  repositoryAccess: Array<RepositoryAccess & {
    githubUser: GithubUser & {
      employee: Employee | null;
    };
  }>;
};

export async function listRepositories(
  search = "",
  visibility: RepositoryVisibilityFilter = "all"
): Promise<Repository[]> {
  try {
    const result = await fetchBackend<{ repositories: Repository[] }>(
      `/api/repositories?q=${encodeURIComponent(search)}&visibility=${visibility}`
    );
    return result.repositories ?? [];
  } catch (error) {
    console.error("Failed to list repositories:", error);
    return [];
  }
}

export async function getRepositoryMetrics(): Promise<{
  repositories: number;
  collaborators: number;
  accessRows: number;
  syncJobs: number;
  lastSyncJob: any;
}> {
  try {
    return await fetchBackend<any>("/api/repositories/metrics");
  } catch (error) {
    console.error("Failed to fetch repository metrics:", error);
    return {
      repositories: 0,
      collaborators: 0,
      accessRows: 0,
      syncJobs: 0,
      lastSyncJob: null
    };
  }
}

export async function listRepositoryAccess(repositoryId: string): Promise<RepositoryAccessWithUser[]> {
  try {
    return await fetchBackend<RepositoryAccessWithUser[]>(`/api/repositories/${repositoryId}/access`);
  } catch (error) {
    console.error(`Failed to fetch access for repo ${repositoryId}:`, error);
    return [];
  }
}

export async function getRepositoryById(id: string): Promise<RepositoryWithAccessAndUser | null> {
  try {
    return await fetchBackend<RepositoryWithAccessAndUser | null>(`/api/repositories/${id}`);
  } catch (error) {
    console.error(`Failed to fetch repo ${id}:`, error);
    return null;
  }
}

export async function getRepositoryByIdentifier(identifier: string): Promise<RepositoryWithAccessAndUser | null> {
  try {
    return await fetchBackend<RepositoryWithAccessAndUser | null>(`/api/repositories/${identifier}`);
  } catch (error) {
    console.error(`Failed to fetch repo identifier ${identifier}:`, error);
    return null;
  }
}
