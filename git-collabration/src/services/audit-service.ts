import { fetchBackend } from "@/lib/backend";

export async function recordAuditEvent(input: {
  actionType: string;
  entityType: string;
  entityId?: string | null;
  performedBy?: string | null;
  details?: any;
}): Promise<any> {
  return fetchBackend<any>("/api/governance/audit-logs", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
