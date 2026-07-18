import { NextResponse } from "next/server";
import { removeCollaboratorFromAllRepos } from "@/services/offboarding-service";
import { toJsonSafe } from "@/lib/json";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      githubUserId?: string;
      executedBy?: string;
    };

    if (!body.githubUserId?.trim()) {
      return NextResponse.json({ error: "githubUserId is required" }, { status: 400 });
    }

    const result = await removeCollaboratorFromAllRepos(
      body.githubUserId.trim(),
      body.executedBy ?? "admin"
    );

    return NextResponse.json({ result: toJsonSafe(result) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to remove collaborator from all repositories"
      },
      { status: 400 }
    );
  }
}
