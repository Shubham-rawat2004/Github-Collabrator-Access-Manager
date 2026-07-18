import { NextResponse } from "next/server";
import { listRepositories, type RepositoryVisibilityFilter } from "@/services/repository-service";
import { toJsonSafe } from "@/lib/json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const visibility = (searchParams.get("visibility") ?? "all") as RepositoryVisibilityFilter;

  const repositories = await listRepositories(q, visibility);
  return NextResponse.json({ repositories: toJsonSafe(repositories) });
}
