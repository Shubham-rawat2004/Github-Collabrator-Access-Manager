import { NextResponse } from "next/server";
import { removeCollaboratorsFromRepository } from "@/services/offboarding-service";
import { toJsonSafe } from "@/lib/json";
import { githubClient } from "@/services/github/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      repositoryId?: string;
      githubUserIds?: string[];
      executedBy?: string;
    };

    if (!body.repositoryId?.trim()) {
      return NextResponse.json({ error: "repositoryId is required" }, { status: 400 });
    }

    if (!body.githubUserIds || !Array.isArray(body.githubUserIds) || body.githubUserIds.length === 0) {
      return NextResponse.json({ error: "githubUserIds array is required and must not be empty" }, { status: 400 });
    }

    const repositoryId = body.repositoryId.trim();

    // Fetch repository record from DB to obtain fullName
    const repoRecord = await prisma.repository.findUnique({
      where: { id: repositoryId }
    });

    if (!repoRecord) {
      return NextResponse.json({ error: "Repository not found." }, { status: 404 });
    }

    // Verify repository permission from GitHub API
    const [owner, repoName] = repoRecord.fullName.split("/");
    let hasAdminPermission = false;
    let adminUsername: string | null = null;
    try {
      const repoDetails = await githubClient.getRepository(owner, repoName);
      hasAdminPermission = repoDetails.permissions?.admin === true;

      const authenticatedUser = await githubClient.getAuthenticatedUser();
      adminUsername = authenticatedUser.login;
    } catch (e) {
      console.error("Failed to verify repository permissions with GitHub:", e);
    }

    if (!hasAdminPermission) {
      return NextResponse.json(
        { error: "You don't have permission to remove collaborators from this repository." },
        { status: 403 }
      );
    }

    // Check if the admin is trying to remove themselves
    if (adminUsername) {
      const targetAdminUser = await prisma.githubUser.findFirst({
        where: {
          id: { in: body.githubUserIds },
          githubUsername: { equals: adminUsername, mode: "insensitive" }
        }
      });

      if (targetAdminUser) {
        return NextResponse.json(
          { error: "You cannot remove yourself as an administrator." },
          { status: 400 }
        );
      }
    }

    const result = await removeCollaboratorsFromRepository(
      repositoryId,
      body.githubUserIds,
      body.executedBy ?? "admin"
    );

    return NextResponse.json({ result: toJsonSafe(result) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to remove collaborators"
      },
      { status: 400 }
    );
  }
}
