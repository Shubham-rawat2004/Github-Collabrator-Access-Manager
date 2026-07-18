import { NextResponse } from "next/server";
import { listCollaborators } from "@/services/collaborator-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const collaborators = await listCollaborators(q);
  return NextResponse.json({
    collaborators: collaborators.map((collaborator) => ({
      id: collaborator.id,
      githubUsername: collaborator.githubUsername,
      githubId: collaborator.githubId ? collaborator.githubId.toString() : null,
      githubProfileUrl: collaborator.githubProfileUrl,
      employeeId: collaborator.employeeId,
      employee: collaborator.employee
        ? {
            id: collaborator.employee.id,
            fullName: collaborator.employee.fullName
          }
        : null,
      repositoryAccess: collaborator.repositoryAccess.map((access) => ({
        id: access.id,
        permission: access.permission,
        source: access.source,
        repository: {
          id: access.repository.id,
          name: access.repository.name,
          fullName: access.repository.fullName
        }
      }))
    }))
  });
}
