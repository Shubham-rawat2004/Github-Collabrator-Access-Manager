import { NextResponse } from "next/server";
import { createApprovalRequest, listApprovalRequests } from "@/services/governance-service";

export async function GET() {
  const approvals = await listApprovalRequests(100);
  return NextResponse.json({
    approvalRequests: approvals
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      requestType?: string;
      referenceId?: string;
      requestedBy?: string;
    };

    if (!body.requestType?.trim()) {
      return NextResponse.json({ error: "requestType is required" }, { status: 400 });
    }

    const approval = await createApprovalRequest({
      requestType: body.requestType,
      referenceId: body.referenceId ?? null,
      requestedBy: body.requestedBy ?? "admin"
    });

    return NextResponse.json({ approvalRequest: approval }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create approval request"
      },
      { status: 400 }
    );
  }
}
