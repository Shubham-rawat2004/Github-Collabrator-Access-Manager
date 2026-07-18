import { GovernanceConsole } from "@/components/governance-console";
import { PageShell } from "@/components/page-shell";
import { formatDateTimeIST } from "@/lib/date";
import { listApprovalRequests, listAuditLogs } from "@/services/governance-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date | null | undefined) {
  return formatDateTimeIST(value);
}

export default async function GovernancePage() {
  const [auditLogs, approvalRequests] = await Promise.all([listAuditLogs(100), listApprovalRequests(100)]);

  return (
    <PageShell title="Governance" description="Audit trail and approval queue for access-sensitive actions.">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="grid gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-sky-600">Audit</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Recent audit events</h2>
            <p className="mt-2 text-sm text-slate-600">
              Every sync, mapping change, approval decision, and removal action is captured here for traceability.
            </p>
          </div>
          <div className="grid gap-3">
            {auditLogs.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No audit events yet.</div>
            ) : (
              auditLogs.map((log) => (
                <article key={log.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{log.actionType}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {log.entityType}
                        {log.entityId ? ` · ${log.entityId}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">By {log.performedBy ?? "unknown"} on {formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                  {log.details ? <pre className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(log.details, null, 2)}</pre> : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-4">
          <GovernanceConsole approvalRequests={approvalRequests} />
        </section>
      </div>
    </PageShell>
  );
}
