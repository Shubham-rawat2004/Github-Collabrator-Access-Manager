"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RepositoryVisibilityFilter } from "@/services/repository-service";

type RepositoryCard = {
  id: string;
  name: string;
  fullName: string;
  visibility: string | null;
  archived: boolean;
  isActive: boolean;
  liveUrl: string | null;
};

export function RepositoryBrowser({
  repositories,
  initialQuery,
  initialVisibility
}: {
  repositories: RepositoryCard[];
  initialQuery: string;
  initialVisibility: RepositoryVisibilityFilter;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [visibility, setVisibility] = useState<RepositoryVisibilityFilter>(initialVisibility);

  const filteredRepositories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return repositories.filter((repository) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        repository.name.toLowerCase().includes(normalizedQuery) ||
        repository.fullName.toLowerCase().includes(normalizedQuery);
      const repositoryVisibility = repository.visibility?.toLowerCase() === "public" ? "public" : "private";
      const matchesVisibility = visibility === "all" ? true : repositoryVisibility === visibility;

      return matchesQuery && matchesVisibility;
    });
  }, [query, repositories, visibility]);

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-end">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Search repositories</span>
            <input
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search repositories"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Visibility</span>
            <select
              name="visibility"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as RepositoryVisibilityFilter)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="all">All repositories</option>
              <option value="public">Public only</option>
              <option value="private">Private only</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4">
        {filteredRepositories.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500">No repositories found.</div>
        ) : (
          filteredRepositories.map((repository) => {
            const visibilityLabel = repository.visibility?.toLowerCase() === "public" ? "Public" : "Private";

            return (
              <article key={repository.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/repositories/${repository.id}`} className="text-xl font-semibold tracking-[-0.02em] text-slate-950 hover:underline">
                      {repository.name}
                    </Link>
                    <p className="mt-1 truncate text-sm text-slate-500">{repository.fullName}</p>
                    {repository.liveUrl && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <a
                          href={repository.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-1"
                        >
                          <span>{repository.liveUrl}</span>
                          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className={`rounded-full border px-3 py-1 font-medium ${
                      repository.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {repository.isActive ? "active" : "inactive"}
                    </span>
                    <span className={`rounded-full border px-3 py-1 font-medium ${
                      repository.visibility?.toLowerCase() === "public"
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}>
                      {visibilityLabel}
                    </span>
                    {repository.archived ? (
                      <span className="rounded-full border bg-amber-50 px-3 py-1 text-amber-700 border-amber-200 font-medium">
                        archived
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
