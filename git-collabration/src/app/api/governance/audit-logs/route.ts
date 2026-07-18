import { NextResponse } from "next/server";
import { listAuditLogs } from "@/services/governance-service";

export async function GET() {
  const logs = await listAuditLogs(100);
  return NextResponse.json({
    auditLogs: logs
  });
}
