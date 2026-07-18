import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { getDashboardOverview, type DashboardOverview } from "@/services/dashboard-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const overview: DashboardOverview = await getDashboardOverview();

  return (
    <PageShell title="Dashboard">
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
