import { NextResponse } from "next/server";
import { updateApprovalRequestStatus } from "@/services/governance-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      status?: "APPROVED" | "REJECTED";
      actedBy?: string;
    };

    if (body.status !== "APPROVED" && body.status !== "REJECTED") {
      return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
    }

    const approval = await updateApprovalRequestStatus(id, {
      status: body.status,
      actedBy: body.actedBy ?? "admin"
    });

    return NextResponse.json({ approvalRequest: approval });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update approval request"
      },
      { status: 400 }
    );
  }
}
