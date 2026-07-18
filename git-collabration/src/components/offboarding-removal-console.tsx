"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type EmployeeOption = {
  id: string;
  fullName: string;
  email: string | null;
  githubUsers: Array<{
    id: string;
    githubUsername: string;
    repositoryAccess: Array<{
      repository: {
        id: string;
        fullName: string;
      };
    }>;
  }>;
};

function getEmployeeRepositories(employee: EmployeeOption) {
  const repositories = new Map<string, string>();

  for (const githubUser of employee.githubUsers) {
    for (const access of githubUser.repositoryAccess) {
      repositories.set(access.repository.id, access.repository.fullName);
    }
  }

  return Array.from(repositories.entries()).map(([id, fullName]) => ({
    id,
    fullName
  }));
}

function formatGithubUsers(employee: EmployeeOption) {
  return Array.from(new Set(employee.githubUsers.map((githubUser) => githubUser.githubUsername)));
}

export function OffboardingRemovalConsole({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return employees;
    }

    return employees.filter((employee) => {
      const matchesName = employee.fullName.toLowerCase().includes(normalizedQuery);
      const matchesEmail = employee.email?.toLowerCase().includes(normalizedQuery) ?? false;
      const matchesGithub = employee.githubUsers.some((githubUser) =>
        githubUser.githubUsername.toLowerCase().includes(normalizedQuery)
      );

      return matchesName || matchesEmail || matchesGithub;
    });
  }, [employees, searchQuery]);

  useEffect(() => {
    if (filteredEmployees.length === 0) {
      if (selectedEmployeeId) {
        setSelectedEmployeeId("");
      }
      return;
    }

    const selectedEmployeeExists = filteredEmployees.some((employee) => employee.id === selectedEmployeeId);
    if (!selectedEmployeeExists) {
      setSelectedEmployeeId(filteredEmployees[0].id);
    }
  }, [filteredEmployees, selectedEmployeeId]);

  const selectedEmployee = useMemo(
    () => {
      if (!selectedEmployeeId) {
        return null;
      }

      const selected = employees.find((employee) => employee.id === selectedEmployeeId) ?? null;
      if (!selected) {
        return null;
      }

      if (filteredEmployees.length > 0 && !filteredEmployees.some((employee) => employee.id === selectedEmployeeId)) {
        return null;
      }

      return selected;
    },
    [employees, filteredEmployees, selectedEmployeeId]
  );

  const repositoryList = useMemo(() => {
    if (!selectedEmployee) {
      return [];
    }

    return getEmployeeRepositories(selectedEmployee);
  }, [selectedEmployee]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!selectedEmployeeId) {
      setStatus("Select an employee first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/offboarding/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          executedBy: "admin"
        })
      });

      const result = (await response.json()) as {
        error?: string;
        result?: {
          employeeName?: string;
          removed?: number;
          alreadyClear?: boolean;
        };
      };

      if (!response.ok) {
        setStatus(result.error ?? "Unable to remove employee access.");
        return;
      }

      const removedCount = result.result?.removed ?? 0;
      const employeeName = result.result?.employeeName ?? "employee";
      setStatus(
        result.result?.alreadyClear
          ? `${employeeName} already had no GitHub access to remove.`
          : `Removed GitHub access for ${employeeName}${removedCount > 0 ? ` across ${removedCount} repositories.` : "."}`
      );
      setSearchQuery("");
      router.refresh();
    } catch {
      setStatus("Unable to remove employee access.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="h-full rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6">
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-2 lg:items-end">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Search employee</span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, email, or GitHub username"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:border-slate-400 focus:bg-white"
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm text-slate-500" style = {{
                overflowX: "hidden"
              }}>
            <span>Employee to remove</span>
            <select
              value={selectedEmployeeId}
              onChange={(event) => setSelectedEmployeeId(event.target.value)}
              disabled={filteredEmployees.length === 0}
              className="h-[50px] rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60" style = {{
                overflowX: "hidden"
              }}
            >
              {filteredEmployees.length === 0 ? (
                <option value="">No matching employees</option>
              ) : (
                filteredEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                    {employee.email ? ` (${employee.email})` : ""}
                    {employee.githubUsers.length > 0 ? ` - GitHub: ${formatGithubUsers(employee).join(", ")}` : ""}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50/40 p-1 sm:p-5">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Selected employee</p>

          {selectedEmployee ? (
            <div className="mt-3 grid gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">{selectedEmployee.fullName}</h3>
                <p className="mt-1 text-sm text-slate-600">{selectedEmployee.email ?? "No email address on file"}</p>
                <p className="mt-1 text-sm text-slate-600">
                  GitHub: {formatGithubUsers(selectedEmployee).join(", ")}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Repositories with access</p>
                <div className="mt-3 grid gap-2">
                  {repositoryList.length === 0 ? (
                    <p className="text-sm text-slate-500">No repository access found.</p>
                  ) : (
                    repositoryList.map((repository) => (
                      <div
                        key={repository.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                      >
                        <span className="mr-2 text-slate-500">-</span>
                        {repository.fullName}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No employee selected.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!selectedEmployeeId || isSubmitting}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Removing..." : "Remove access"}
          </button>
          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
        </div>
      </form>
    </section>
  );
}
