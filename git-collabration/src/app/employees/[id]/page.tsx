import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getEmployeeById } from "@/services/employee-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getInitials(name: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getPermissionBadge(permission: string) {
  const norm = permission.toLowerCase();
  const baseClass = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border";
  
  if (norm === "admin") {
    return <span className={`${baseClass} bg-rose-50 text-rose-700 border-rose-100`}>Admin</span>;
  }
  if (norm === "write") {
    return <span className={`${baseClass} bg-indigo-50 text-indigo-700 border-indigo-100`}>Write</span>;
  }
  if (norm === "read") {
    return <span className={`${baseClass} bg-slate-50 text-slate-600 border-slate-100`}>Read</span>;
  }
  return <span className={`${baseClass} bg-slate-100 text-slate-600 border-slate-200`}>{permission}</span>;
}

export default async function EmployeeDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = (await getEmployeeById(id)) as Awaited<ReturnType<typeof getEmployeeById>>;

  if (!employee) {
    notFound();
  }

  return (
    <PageShell 
      title={employee.fullName} 
      description="Review detailed profile information, mapped accounts, and authorized repositories."
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-start">
        {/* Left Side: Employee Corporate Bio */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              {/* Huge profile initials block */}
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-indigo-50 text-indigo-700 font-extrabold text-2xl shadow-sm">
                {getInitials(employee.fullName)}
              </div>
              
              <h2 className="mt-4 text-xl font-bold text-slate-900">{employee.fullName}</h2>
              
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${employee.isActive ? "bg-emerald-400" : "bg-slate-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${employee.isActive ? "bg-emerald-500" : "bg-slate-500"}`}></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {employee.isActive ? "Active employee" : "inactive employee"}
                </span>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold leading-normal">
                <span className="text-slate-400 uppercase tracking-wide text-[9px] font-bold">Email Address</span>
                <span className="text-slate-700 font-bold">{employee.email ?? "n/a"}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs font-semibold leading-normal">
                <span className="text-slate-400 uppercase tracking-wide text-[9px] font-bold">Mapped accounts</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  {employee.githubUsers.length} GitHub ID(s)
                </span>
              </div>
            </div>

            {employee.notes && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Administrative Notes</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{employee.notes}</p>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 mt-2">
              <Link 
                href="/employees" 
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm"
              >
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Return to Directory</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Right Side: GitHub Credentials and Repositories List */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600">Identity Authority</span>
          <h2 className="mt-2.5 text-lg font-bold text-slate-900">GitHub Access Rights</h2>

          <div className="mt-6 space-y-6">
            {employee.githubUsers.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-4 text-xs font-bold text-slate-900">No accounts assigned</h3>
                <p className="mt-1 text-xs text-slate-400">Open the mapping workspace to connect a synced GitHub user to this profile.</p>
              </div>
            ) : (
              employee.githubUsers.map((user: any) => (
                <div 
                  key={user.id} 
                  className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <p className="font-bold text-slate-900">@{user.githubUsername}</p>
                      
                      {user.githubProfileUrl ? (
                        <a 
                          href={user.githubProfileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[11px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>Open profile page</span>
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">No personal URL linked</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Authorized Repository Privileges ({user.repositoryAccess.length})
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {user.repositoryAccess.map((access: any) => (
                        <div 
                          key={access.id} 
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-1.5"
                        >
                          <span className="text-[11px] font-bold text-slate-700">{access.repository.name}</span>
                          <span className="text-slate-300">|</span>
                          {getPermissionBadge(access.permission)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
