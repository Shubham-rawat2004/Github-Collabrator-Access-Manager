import { NextResponse } from "next/server";
import { createOffboardingJob, listOffboardingJobs } from "@/services/offboarding-service";
import { toJsonSafe } from "@/lib/json";

export async function GET() {
  const jobs = await listOffboardingJobs(50);
  return NextResponse.json({
    offboardingJobs: toJsonSafe(jobs)
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      employeeId?: string;
      requestedBy?: string;
      reason?: string;
    };

    if (!body.employeeId?.trim()) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const job = await createOffboardingJob(body.employeeId, body.requestedBy ?? "admin", body.reason ?? null);
    return NextResponse.json({ offboardingJob: toJsonSafe(job) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create offboarding job"
      },
      { status: 400 }
    );
  }
}
