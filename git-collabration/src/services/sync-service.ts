import { fetchBackend } from "@/lib/backend";

export async function runSync(initiatedBy = "admin"): Promise<any> {
  return fetchBackend<any>("/api/sync", {
    method: "POST",
    body: JSON.stringify({ initiatedBy })
  });
}

export async function getSyncJobs(): Promise<any[]> {
  return fetchBackend<any[]>("/api/sync");
}
