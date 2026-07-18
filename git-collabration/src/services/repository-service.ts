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
  const result = await fetchBackend<{ repositories: Repository[] }>(
    `/api/repositories?q=${encodeURIComponent(search)}&visibility=${visibility}`
  );
  return result.repositories;
}

export async function getRepositoryMetrics(): Promise<{
  repositories: number;
  collaborators: number;
  accessRows: number;
  syncJobs: number;
  lastSyncJob: any;
}> {
  return fetchBackend<any>("/api/repositories/metrics");
}

export async function listRepositoryAccess(repositoryId: string): Promise<RepositoryAccessWithUser[]> {
  return fetchBackend<RepositoryAccessWithUser[]>(`/api/repositories/${repositoryId}/access`);
}

export async function getRepositoryById(id: string): Promise<RepositoryWithAccessAndUser | null> {
  return fetchBackend<RepositoryWithAccessAndUser | null>(`/api/repositories/${id}`);
}

export async function getRepositoryByIdentifier(identifier: string): Promise<RepositoryWithAccessAndUser | null> {
  return fetchBackend<RepositoryWithAccessAndUser | null>(`/api/repositories/${identifier}`);
}
