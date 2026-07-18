import { PageShell } from "@/components/page-shell";
import { isDatabaseUnavailableError } from "@/lib/db-errors";
import { listCollaborators } from "@/services/collaborator-service";
import { RemoveCollaboratorButton } from "@/components/remove-collaborator-button";
import { CopyButton } from "@/components/copy-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function CollaboratorsPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q ?? "";
  let collaborators: Awaited<ReturnType<typeof listCollaborators>> = [];
  let databaseNotice: string | null = null;

  try {
    collaborators = (await listCollaborators(query)) as Awaited<ReturnType<typeof listCollaborators>>;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    databaseNotice = "Database unavailable. Collaborator search is showing a safe empty state.";
  }

  return (
    <PageShell title="Collaborators">
      {databaseNotice ? (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
          {databaseNotice}
        </div>
      ) : null}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Search collaborators</span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                name="q"
                defaultValue={query}
                placeholder="Search by GitHub username"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>
          </label>

          <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800">
            Search
          </button>
        </form>
      </section>

      <div className="grid gap-4">
        {collaborators.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white py-16 px-4 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No matching collaborators</h3>
            <p className="mt-1 text-xs text-slate-400">Try a different search term.</p>
          </div>
        ) : (
          collaborators.map((collaborator) => {
            const repositories = collaborator.repositoryAccess.map((access) => access.repository);
            const uniqueProjectNames = Array.from(
              new Map(repositories.map((repository) => [repository.id, repository.fullName])).values()
            );

            return (
              <article key={collaborator.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-lg font-semibold tracking-[-0.02em] text-slate-950">@{collaborator.githubUsername}</p>
                        <CopyButton text={`@${collaborator.githubUsername}`} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Projects collaborated on</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                        {uniqueProjectNames.length} repos
                      </span>
                      <RemoveCollaboratorButton
                        githubUserId={collaborator.id}
                        githubUsername={collaborator.githubUsername}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {uniqueProjectNames.map((repositoryName) => (
                      <span key={repositoryName} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                        {repositoryName}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
