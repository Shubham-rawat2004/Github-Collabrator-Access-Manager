import { NextResponse } from "next/server";
import { mapGithubUserToEmployee } from "@/services/employee-service";
import { recordAuditEvent } from "@/services/audit-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      githubUserId?: string;
      employeeId?: string;
    };

    if (!body.githubUserId) {
      return NextResponse.json(
        { error: "Select a synced GitHub user first. Run sync if the list is empty." },
        { status: 400 }
      );
    }

    const githubUser = await mapGithubUserToEmployee(body.githubUserId, body.employeeId?.trim() ? body.employeeId : null);

    await recordAuditEvent({
      actionType: "USER_MAPPED",
      entityType: "github_users",
      entityId: githubUser.id,
      performedBy: "admin",
      details: {
        employeeId: githubUser.employeeId
      }
    });

    return NextResponse.json({
      githubUser: {
        id: githubUser.id,
        githubId: githubUser.githubId ? githubUser.githubId.toString() : null,
        githubUsername: githubUser.githubUsername,
        githubProfileUrl: githubUser.githubProfileUrl,
        employeeId: githubUser.employeeId
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save mapping"
      },
      { status: 400 }
    );
  }
}
