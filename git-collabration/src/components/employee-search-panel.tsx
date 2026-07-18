"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type EmployeeSearchItem = {
  id: string;
  fullName: string;
  email: string | null;
  githubUsers: Array<{
    id: string;
    githubUsername: string;
  }>;
};

export function EmployeeSearchPanel({ employees }: { employees: EmployeeSearchItem[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return employees.filter((employee) => {
      return employee.fullName.toLowerCase().startsWith(normalizedQuery);
    });
  }, [employees, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400 font-semibold">Search Employees</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">Find employee records instantly</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 font-medium">
            {results.length} results
          </span>
        </div>

        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-semibold text-slate-700">Employee Search</span>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            >
              <path
                d="M21 21l-4.35-4.35m1.85-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder=""
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-slate-400 focus:bg-white"
            />
          </div>
        </label>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          {!hasQuery ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-400">
              <svg className="mx-auto h-8 w-8 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <p className="text-sm font-semibold text-slate-600">Start searching employees</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-400">
              <svg className="mx-auto h-8 w-8 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-slate-600">No matching employees</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px] leading-relaxed">Try typing a different name or checking details.</p>
            </div>
          ) : (
            <div className="grid max-h-[520px] gap-3 overflow-auto pr-1">
              {results.map((employee) => (
                <Link
                  key={employee.id}
                  href={`/employees/${employee.id}`}
                  className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-slate-950">{employee.fullName}</h3>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{employee.email ?? "No email"}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                      {employee.githubUsers.length} mapped
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
