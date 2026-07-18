"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatDateTimeIST } from "@/lib/date";

type ApprovalRequestView = {
  id: string;
  requestType: string | null;
  referenceId: string | null;
  status: string;
  requestedBy: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
};

export function GovernanceConsole({
  approvalRequests
}: {
  approvalRequests: ApprovalRequestView[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [requestType, setRequestType] = useState("");
  const [referenceId, setReferenceId] = useState("");

  async function createApprovalRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/governance/approvals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requestType,
        referenceId: referenceId.trim() || null,
        requestedBy: "admin"
      })
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error ?? "Unable to create approval request.");
      return;
    }

    setRequestType("");
    setReferenceId("");
    setStatus("Approval request created.");
    router.refresh();
  }

  async function updateApprovalRequest(id: string, nextStatus: "APPROVED" | "REJECTED") {
    setStatus(null);

    const response = await fetch(`/api/governance/approvals/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: nextStatus,
        actedBy: "admin"
      })
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error ?? "Unable to update approval request.");
      return;
    }

    setStatus(nextStatus === "APPROVED" ? "Approval request approved." : "Approval request rejected.");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={createApprovalRequest}
        className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
      >
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.28em] text-sky-600">Create request</p>
          <h2 className="text-xl font-semibold text-slate-950">New approval request</h2>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Request type</span>
            <input
              value={requestType}
              onChange={(event) => setRequestType(event.target.value)}
              placeholder="ACCESS_CHANGE, OFFBOARDING, MAPPING"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Reference ID</span>
            <input
              value={referenceId}
              onChange={(event) => setReferenceId(event.target.value)}
              placeholder="Optional linked record ID or ticket"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <button type="submit" className="self-start rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white">
            Create Approval
          </button>
          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
        </div>
      </form>

      <section className="grid gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-sky-600">Queue</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Approval requests</h2>
        </div>
        <div className="grid gap-3">
          {approvalRequests.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No approval requests yet.</div>
          ) : (
            approvalRequests.map((request) => (
              <article key={request.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{request.requestType ?? "Unknown request"}</p>
                    <p className="mt-1 text-xs text-slate-500">Reference: {request.referenceId ?? "n/a"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Requested by {request.requestedBy ?? "unknown"} on {formatDateTimeIST(request.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                    {request.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateApprovalRequest(request.id, "APPROVED")}
                    disabled={request.status !== "PENDING"}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApprovalRequest(request.id, "REJECTED")}
                    disabled={request.status !== "PENDING"}
                    className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
