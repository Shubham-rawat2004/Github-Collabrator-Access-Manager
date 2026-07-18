import { fetchBackend } from "@/lib/backend";
import { ApprovalRequest } from "@prisma/client";

export async function listAuditLogs(limit = 50): Promise<any[]> {
  const result = await fetchBackend<{ auditLogs: any[] }>("/api/governance/audit-logs");
  return result.auditLogs.slice(0, limit);
}

export async function listApprovalRequests(limit = 50): Promise<ApprovalRequest[]> {
  const result = await fetchBackend<{ approvalRequests: ApprovalRequest[] }>("/api/governance/approvals");
  return result.approvalRequests.slice(0, limit);
}

export async function createApprovalRequest(input: {
  requestType: string;
  referenceId?: string | null;
  requestedBy?: string | null;
}): Promise<ApprovalRequest> {
  const result = await fetchBackend<{ approvalRequest: ApprovalRequest }>("/api/governance/approvals", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return result.approvalRequest;
}

export async function updateApprovalRequestStatus(
  id: string,
  input: {
    status: "APPROVED" | "REJECTED";
    actedBy?: string | null;
  }
): Promise<ApprovalRequest> {
  const result = await fetchBackend<{ approvalRequest: ApprovalRequest }>(`/api/governance/approvals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
  return result.approvalRequest;
}
