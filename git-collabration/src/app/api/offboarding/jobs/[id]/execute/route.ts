import { NextResponse } from "next/server";
import { executeOffboardingJob } from "@/services/offboarding-service";
import { toJsonSafe } from "@/lib/json";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { executedBy?: string };
    const job = await executeOffboardingJob(id, body.executedBy ?? "admin");
    return NextResponse.json({ offboardingJob: toJsonSafe(job) });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to execute offboarding job"
      },
      { status: 400 }
    );
  }
}
