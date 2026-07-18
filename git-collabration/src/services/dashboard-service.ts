import { fetchBackend } from "@/lib/backend";

export type DashboardOverview = {
  repositories: number;
  collaborators: number;
  mappedUsers: number;
  syncJobs: number;
  lastSyncJob: { createdAt: Date } | null;
  databaseReady: boolean;
  databaseNotice: string | null;
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return fetchBackend<DashboardOverview>("/api/dashboard/overview");
}
