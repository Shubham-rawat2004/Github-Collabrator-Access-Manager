import { fetchBackend } from "@/lib/backend";
import { GithubUser, Employee, RepositoryAccess, Repository } from "@prisma/client";

export type CollaboratorWithAccess = GithubUser & {
  employee: Employee | null;
  repositoryAccess: Array<RepositoryAccess & {
    repository: Repository;
  }>;
};

export async function listCollaborators(search = ""): Promise<CollaboratorWithAccess[]> {
  try {
    const result = await fetchBackend<{ collaborators: CollaboratorWithAccess[] }>(
      `/api/collaborators?q=${encodeURIComponent(search)}`
    );
    return result.collaborators ?? [];
  } catch (error) {
    console.error("Failed to list collaborators:", error);
    return [];
  }
}
