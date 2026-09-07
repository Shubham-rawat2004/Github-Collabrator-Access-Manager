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
  try {
    return await fetchBackend<DashboardOverview>("/api/dashboard/overview");
  } catch (error) {
    console.error("Failed to fetch dashboard overview from backend:", error);
    return {
      repositories: 0,
      collaborators: 0,
      mappedUsers: 0,
      syncJobs: 0,
      lastSyncJob: null,
      databaseReady: false,
      databaseNotice: "Backend service is warming up or connecting. Please refresh in a moment."
    };
  }
}
