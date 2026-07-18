import { PageShell } from "@/components/page-shell";
import { RepositoryBrowser } from "@/components/repository-browser";
import { listRepositories, type RepositoryVisibilityFilter } from "@/services/repository-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RepositoriesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; visibility?: RepositoryVisibilityFilter }>;
}) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const visibility = params?.visibility ?? "all";
  const repositories = (await listRepositories()) as Awaited<ReturnType<typeof listRepositories>>;

  return (
    <PageShell title="Repositories">
      <RepositoryBrowser repositories={repositories} initialQuery={query} initialVisibility={visibility} />
    </PageShell>
  );
}
