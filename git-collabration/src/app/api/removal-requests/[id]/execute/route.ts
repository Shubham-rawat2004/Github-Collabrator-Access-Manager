import { NextResponse } from "next/server";
import { executeRemovalRequest } from "@/services/offboarding-service";
import { toJsonSafe } from "@/lib/json";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { executedBy?: string };
    const removalRequest = await executeRemovalRequest(id, body.executedBy ?? "admin");
    return NextResponse.json({ removalRequest: toJsonSafe(removalRequest) });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to execute removal request"
      },
      { status: 400 }
    );
  }
}
