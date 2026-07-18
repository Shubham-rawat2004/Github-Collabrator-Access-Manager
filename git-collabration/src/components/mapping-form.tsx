"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function MappingForm({
  githubUsers,
  employees
}: {
  githubUsers: Array<{ id: string; githubUsername: string }>;
  employees: Array<{ id: string; fullName: string }>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const canSubmit = githubUsers.length > 0 && employees.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const githubUserId = String(formData.get("githubUserId") ?? "").trim();
    const employeeId = String(formData.get("employeeId") ?? "").trim();

    if (!githubUserId) {
      setStatus("Pick a synced GitHub user first.");
      return;
    }

    const response = await fetch("/api/github-users/mapping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        githubUserId,
        employeeId
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setStatus(result.error ?? "Mapping failed.");
      return;
    }

    setStatus("Mapping saved.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 h-full flex flex-col justify-between"
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-700">GitHub user</span>
            <select
              name="githubUserId"
              defaultValue=""
              disabled={!canSubmit}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select GitHub user</option>
              {githubUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.githubUsername}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-700">Employee</span>
            <select
              name="employeeId"
              defaultValue=""
              disabled={!canSubmit}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Unmap employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex h-10 items-center justify-center rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_12px_24px_rgba(15,23,42,0.18)] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Mapping
        </button>
        {status ? <p className="text-xs font-semibold text-slate-600 text-center">{status}</p> : null}
      </div>

      {!canSubmit ? <p className="text-sm text-slate-600">Run sync first so GitHub users exist locally, then map them here.</p> : null}
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
