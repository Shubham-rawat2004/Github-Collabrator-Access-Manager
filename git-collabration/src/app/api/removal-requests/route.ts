import { NextResponse } from "next/server";
import { createRemovalRequest, listRemovalRequests } from "@/services/offboarding-service";
import { toJsonSafe } from "@/lib/json";

export async function GET() {
  const removalRequests = await listRemovalRequests(50);
  return NextResponse.json({
    removalRequests: toJsonSafe(removalRequests)
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      githubUserId?: string;
      repositoryId?: string;
      requestedBy?: string;
      reason?: string;
    };

    if (!body.githubUserId?.trim() || !body.repositoryId?.trim()) {
      return NextResponse.json({ error: "githubUserId and repositoryId are required" }, { status: 400 });
    }

    const requestRecord = await createRemovalRequest({
      githubUserId: body.githubUserId,
      repositoryId: body.repositoryId,
      requestedBy: body.requestedBy ?? "admin",
      reason: body.reason ?? null
    });

    return NextResponse.json({ removalRequest: toJsonSafe(requestRecord) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create removal request"
      },
      { status: 400 }
    );
  }
}
