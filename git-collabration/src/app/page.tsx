import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { getDashboardOverview, type DashboardOverview } from "@/services/dashboard-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const overview: DashboardOverview = await getDashboardOverview();

  return (
    <PageShell title="Dashboard">
      {overview.databaseNotice ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>{overview.databaseNotice}</span>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col justify-center min-h-[55vh] py-10 sm:py-16 w-full">
        <section className="grid gap-8 md:grid-cols-3 w-full">
          <StatCard href="/repositories" label="Repositories" value={overview.repositories} subtext="Stored locally from GitHub" />
          <StatCard href="/collaborators" label="Collaborators" value={overview.collaborators} subtext="Unique GitHub identities" />
          <StatCard href="/employees#mapping" label="Mapped Users" value={overview.mappedUsers} subtext="Employee mappings" />
        </section>
      </div>
    </PageShell>
  );
}
