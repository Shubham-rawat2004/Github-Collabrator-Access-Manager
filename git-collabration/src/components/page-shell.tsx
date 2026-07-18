import { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { SiteNav } from "@/components/site-nav";
import { SyncButton } from "@/components/sync-button";

export async function PageShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col px-8 py-6 w-full">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">GitHub Collaborator Access Manager</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{title}</h1>
              {description ? <p className="mt-1 max-w-2xl text-xs text-slate-600">{description}</p> : null}
            </div>
            <div className="flex items-center justify-end gap-3 lg:shrink-0">
              <SyncButton />
              <LogoutButton />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <SiteNav />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
