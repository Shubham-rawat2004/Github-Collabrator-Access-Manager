import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { isDatabaseUnavailableError } from "@/lib/db-errors";
import { getRepositoryByIdentifier } from "@/services/repository-service";
import { RepositoryCollaboratorsList } from "@/components/repository-collaborators-list";
import { githubClient } from "@/services/github/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RepositoryDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let repository = null as Awaited<ReturnType<typeof getRepositoryByIdentifier>>;
  let databaseNotice: string | null = null;

  try {
    repository = await getRepositoryByIdentifier(id);
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    databaseNotice = "Database unavailable. Repository details cannot be loaded right now.";
  }

  if (!repository && !databaseNotice) {
    notFound();
  }

  if (!repository) {
    return (
      <PageShell title="Repository details" description="Repository detail with collaborators and permission levels.">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {databaseNotice}
        </div>
        <Link href="/repositories" className="mt-4 inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white">
          Back to repositories
        </Link>
      </PageShell>
    );
  }

  const collaboratorsData = repository.repositoryAccess.map((access) => ({
    id: access.githubUser.id,
    githubUsername: access.githubUser.githubUsername,
    employeeName: access.githubUser.employee?.fullName ?? null
  }));

  // Verify repository permission from GitHub API
  const [owner, repoName] = repository.fullName.split("/");
  let hasAdminPermission = false;
  let adminUsername: string | null = null;
  try {
    const repoDetails = await githubClient.getRepository(owner, repoName);
    hasAdminPermission = repoDetails.permissions?.admin === true;

    const authenticatedUser = await githubClient.getAuthenticatedUser();
    adminUsername = authenticatedUser.login;
  } catch (e) {
    console.error("Failed to verify repository permissions with GitHub:", e);
  }

  return (
    <PageShell title={repository.name} description="Repository details and synced collaborators.">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="mb-2">
          <Link href="/repositories" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Repositories</span>
          </Link>
        </div>

        {/* Repository Details Section */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{repository.name}</h2>
              <p className="text-sm text-slate-500 mt-1">{repository.fullName}</p>
              {repository.description && (
                <p className="text-sm text-slate-700 mt-3 max-w-2xl">{repository.description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 self-start md:self-center">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                repository.isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                {repository.isActive ? "Active" : "Inactive"}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                repository.visibility?.toLowerCase() === "public"
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              }`}>
                {repository.visibility}
              </span>
              {repository.archived && (
                <span className="rounded-full border bg-amber-50 px-3 py-1 text-xs text-amber-700 border-amber-200 font-semibold">
                  Archived
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Default Branch</span>
                <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7a3 3 0 100-6 3 3 0 000 6zM8 7a3 3 0 120 6 3 3 0 010-6zm0 0h8a3 3 0 013 3v3a3 3 0 01-6 0v-3a3 3 0 013-3z" />
                  </svg>
                  {repository.defaultBranch || "None"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Live URL</span>
                {repository.liveUrl ? (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <a
                      href={repository.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1 hover:underline"
                    >
                      <span>{repository.liveUrl}</span>
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-1 italic">No live URL deployed</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Collaborators list */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.28em] text-sky-600 font-semibold mb-4">Collaborators</p>
          <RepositoryCollaboratorsList
            repositoryId={repository.id}
            collaborators={collaboratorsData}
            hasAdminPermission={hasAdminPermission}
            adminUsername={adminUsername}
          />
        </section>
      </div>
    </PageShell>
  );
}
