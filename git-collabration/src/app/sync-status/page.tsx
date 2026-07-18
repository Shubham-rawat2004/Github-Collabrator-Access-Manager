import { PageShell } from "@/components/page-shell";
import { formatDateTimeIST } from "@/lib/date";
import { getSyncJobs } from "@/services/sync-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date | null | undefined) {
  return formatDateTimeIST(value);
}

export default async function SyncStatusPage() {
  const jobs = await getSyncJobs();

  return (
    <PageShell title="Sync Status" description="Manual sync history and the current state of recent synchronization runs.">
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No sync jobs recorded yet.</div>
        ) : (
          jobs.map((job) => (
            <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{job.status}</h2>
                  <p className="mt-1 text-sm text-slate-500">Initiated by {job.initiatedBy ?? "unknown"}</p>
                </div>
                <div className="grid gap-1 text-xs text-slate-500 sm:grid-cols-3 sm:gap-4">
                  <span>Started: {formatDate(job.startedAt)}</span>
                  <span>Completed: {formatDate(job.completedAt)}</span>
                  <span>Errors: {job.errorCount}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <span>Repositories: {job.repositoriesScanned}</span>
                <span>Collaborators: {job.collaboratorsFound}</span>
                <span>Created: {formatDate(job.createdAt)}</span>
              </div>
              {job.errorMessage ? <p className="mt-4 text-sm text-amber-700">{job.errorMessage}</p> : null}
            </article>
          ))
        )}
      </div>
    </PageShell>
  );
}
