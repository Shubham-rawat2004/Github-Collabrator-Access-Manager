"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { formatDateTimeIST } from "@/lib/date";

type EmployeeOption = {
  id: string;
  fullName: string;
  email: string | null;
};

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

export function BulkOffboardingConsole({
  employees,
  approvalRequests
}: {
  employees: EmployeeOption[];
  approvalRequests: ApprovalRequestView[];
}) {
  const router = useRouter();
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const selectedEmployees = useMemo(
    () => employees.filter((employee) => selectedEmployeeIds.includes(employee.id)),
    [employees, selectedEmployeeIds]
  );

  function toggleEmployee(employeeId: string) {
    setSelectedEmployeeIds((current) =>
      current.includes(employeeId) ? current.filter((id) => id !== employeeId) : [...current, employeeId]
    );
  }

  async function submitBulk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/offboarding/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        employeeIds: selectedEmployeeIds,
        requestedBy: "admin"
      })
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error ?? "Unable to create bulk offboarding request.");
      return;
    }

    setSelectedEmployeeIds([]);
    setStatus("Bulk removal request created and sent for approval.");
    router.refresh();
  }

  async function actOnApproval(id: string, nextStatus: "APPROVED" | "REJECTED") {
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
      setStatus(result.error ?? "Unable to update approval.");
      return;
    }

    setStatus(nextStatus === "APPROVED" ? "Bulk request approved and executed." : "Bulk request rejected.");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={submitBulk}
        className="grid flex-1 gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6"
      >
        <div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">Bulk employee removal</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select multiple employees, create one approval-gated bulk request, and the system will create individual removal jobs after approval.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Employees</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {employees.map((employee) => (
                <label
                  key={employee.id}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployeeIds.includes(employee.id)}
                    onChange={() => toggleEmployee(employee.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950"
                  />
                  <span>
                    <span className="block font-medium text-slate-950">{employee.fullName}</span>
                    <span className="block text-xs text-slate-500">{employee.email ?? "No email"}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2">
          <button
            type="submit"
            disabled={selectedEmployeeIds.length === 0}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create Bulk Removal Request
          </button>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span>{selectedEmployees.length} employees selected</span>
            {status ? <p className="text-slate-600">{status}</p> : null}
          </div>
        </div>
      </form>

      <section className="grid gap-4">
        <div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">Approval workflow</h2>
          <p className="mt-2 text-sm text-slate-600">
            Bulk removal requests stay pending until they are approved. Once approved, execution happens automatically.
          </p>
        </div>

        <div className="grid gap-3">
          {approvalRequests.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No bulk approvals pending.
            </div>
          ) : (
            approvalRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.01em] text-slate-950">Bulk removal approval</p>
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
                    onClick={() => actOnApproval(request.id, "APPROVED")}
                    disabled={request.status !== "PENDING"}
                    className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Approve and Execute
                  </button>
                  <button
                    type="button"
                    onClick={() => actOnApproval(request.id, "REJECTED")}
                    disabled={request.status !== "PENDING"}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
