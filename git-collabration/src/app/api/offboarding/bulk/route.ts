import { NextResponse } from "next/server";
import { createBulkOffboardingBatch, listBulkOffboardingBatches } from "@/services/offboarding-service";

export async function GET() {
  const bulkBatches = await listBulkOffboardingBatches(50);
  return NextResponse.json({
    bulkBatches
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      employeeIds?: string[];
      requestedBy?: string;
      reason?: string;
    };

    const bulkBatch = await createBulkOffboardingBatch(body.employeeIds ?? [], body.requestedBy ?? "admin", body.reason ?? null);
    return NextResponse.json({ bulkBatch }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create bulk offboarding request"
      },
      { status: 400 }
    );
  }
}
