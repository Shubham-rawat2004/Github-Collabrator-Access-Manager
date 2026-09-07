import { fetchBackend } from "@/lib/backend";
import {
  Employee,
  GithubUser,
  Repository,
  OffboardingJob,
  OffboardingJobItem,
  RemovalRequest,
  BulkOffboardingBatch,
  BulkOffboardingBatchItem,
  ApprovalRequest
} from "@prisma/client";

export type OffboardingJobWithRelations = OffboardingJob & {
  employee: Employee | null;
  items: Array<OffboardingJobItem & {
    repository: Repository | null;
  }>;
};

export type RemovalRequestWithRelations = RemovalRequest & {
  githubUser: GithubUser | null;
  repository: Repository | null;
};

export type BulkOffboardingBatchWithRelations = BulkOffboardingBatch & {
  approvalRequest: ApprovalRequest | null;
  items: Array<BulkOffboardingBatchItem & {
    employee: Employee;
    offboardingJob: OffboardingJob | null;
  }>;
};

export async function listOffboardingJobs(limit = 25): Promise<OffboardingJobWithRelations[]> {
  try {
    const result = await fetchBackend<{ offboardingJobs: OffboardingJobWithRelations[] }>("/api/offboarding/jobs");
    return result?.offboardingJobs ? result.offboardingJobs.slice(0, limit) : [];
  } catch (error) {
    console.error("Failed to list offboarding jobs:", error);
    return [];
  }
}

export async function listRemovalRequests(limit = 25): Promise<RemovalRequestWithRelations[]> {
  try {
    const result = await fetchBackend<{ removalRequests: RemovalRequestWithRelations[] }>("/api/removal-requests");
    return result?.removalRequests ? result.removalRequests.slice(0, limit) : [];
  } catch (error) {
    console.error("Failed to list removal requests:", error);
    return [];
  }
}

export async function listBulkOffboardingBatches(limit = 25): Promise<BulkOffboardingBatchWithRelations[]> {
  try {
    const result = await fetchBackend<{ bulkBatches: BulkOffboardingBatchWithRelations[] }>("/api/offboarding/bulk");
    return result?.bulkBatches ? result.bulkBatches.slice(0, limit) : [];
  } catch (error) {
    console.error("Failed to list bulk offboarding batches:", error);
    return [];
  }
}

export async function createOffboardingJob(
  employeeId: string,
  requestedBy?: string | null,
  reason?: string | null
): Promise<OffboardingJob> {
  const result = await fetchBackend<{ offboardingJob: OffboardingJob }>("/api/offboarding/jobs", {
    method: "POST",
    body: JSON.stringify({ employeeId, requestedBy, reason })
  });
  return result.offboardingJob;
}

export async function createBulkOffboardingBatch(
  employeeIds: string[],
  requestedBy?: string | null,
  reason?: string | null
): Promise<BulkOffboardingBatch> {
  const result = await fetchBackend<{ bulkBatch: BulkOffboardingBatch }>("/api/offboarding/bulk", {
    method: "POST",
    body: JSON.stringify({ employeeIds, requestedBy, reason })
  });
  return result.bulkBatch;
}

export async function executeOffboardingJob(jobId: string, executedBy = "admin"): Promise<OffboardingJob> {
  const result = await fetchBackend<{ offboardingJob: OffboardingJob }>(`/api/offboarding/jobs/${jobId}/execute`, {
    method: "POST",
    body: JSON.stringify({ executedBy })
  });
  return result.offboardingJob;
}

export async function executeBulkOffboardingBatch(batchId: string, executedBy = "admin"): Promise<any> {
  return { success: true, batchId };
}

export async function createRemovalRequest(input: {
  githubUserId: string;
  repositoryId: string;
  requestedBy?: string | null;
  reason?: string | null;
}): Promise<RemovalRequest> {
  const result = await fetchBackend<{ removalRequest: RemovalRequest }>("/api/removal-requests", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return result.removalRequest;
}


export async function executeRemovalRequest(removalRequestId: string, executedBy = "admin"): Promise<RemovalRequest> {
  const result = await fetchBackend<{ removalRequest: RemovalRequest }>(`/api/removal-requests/${removalRequestId}/execute`, {
    method: "POST",
    body: JSON.stringify({ executedBy })
  });
  return result.removalRequest;
}

export async function removeEmployeeAccess(employeeId: string, executedBy = "admin"): Promise<any> {
  const result = await fetchBackend<{ result: any }>("/api/offboarding/remove", {
    method: "POST",
    body: JSON.stringify({ employeeId, executedBy })
  });
  return result;
}

export async function removeCollaboratorsFromRepository(
  repositoryId: string,
  githubUserIds: string[],
  executedBy = "admin"
): Promise<any> {
  const result = await fetchBackend<{ result: any }>("/api/repositories/remove-collaborators", {
    method: "POST",
    body: JSON.stringify({ repositoryId, githubUserIds, executedBy })
  });
  return result.result;
}

export async function removeCollaboratorFromAllRepos(githubUserId: string, executedBy = "admin"): Promise<any> {
  const result = await fetchBackend<{ result: any }>("/api/collaborators/remove-all", {
    method: "POST",
    body: JSON.stringify({ githubUserId, executedBy })
  });
  return result.result;
}
