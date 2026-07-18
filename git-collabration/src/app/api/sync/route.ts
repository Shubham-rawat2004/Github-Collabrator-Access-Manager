import { NextResponse } from "next/server";
import { runSync } from "@/services/sync-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { initiatedBy?: string };
    const result = await runSync(body.initiatedBy ?? "admin");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sync failed"
      },
      { status: 400 }
    );
  }
}
