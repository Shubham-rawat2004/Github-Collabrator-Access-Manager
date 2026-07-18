import { MappingForm } from "@/components/mapping-form";
import { EmployeeForm } from "@/components/employee-form";
import { EmployeeSearchPanel } from "@/components/employee-search-panel";
import { MappingFocusSection } from "@/components/mapping-focus-section";
import { PageShell } from "@/components/page-shell";
import { listEmployees } from "@/services/employee-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmployeesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  await searchParams;
  const employees = (await listEmployees()) as Awaited<ReturnType<typeof listEmployees>>;
  const githubUsers = await prisma.githubUser.findMany({
    include: {
      employee: true
    },
    orderBy: {
      githubUsername: "asc"
    }
  });
  const allEmployees = await prisma.employee.findMany({
    orderBy: {
      fullName: "asc"
    }
  });

  return (
    <PageShell title="Employees" description="Create employees, review records, and manage GitHub account mappings from one place.">
      <div className="flex flex-col gap-6">
        {/* Top Section: Full Width Search Panel */}
        <EmployeeSearchPanel
          employees={employees.map((employee) => ({
            id: employee.id,
            fullName: employee.fullName,
            email: employee.email,
            githubUsers: employee.githubUsers.map((githubUser) => ({
              id: githubUser.id,
              githubUsername: githubUser.githubUsername
            }))
          }))}
        />

        {/* Bottom Section: Side-by-Side Forms Grid */}
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Left Column: Create Employee */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur flex flex-col justify-between">
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600">Administration</span>
                <h2 className="mt-2.5 text-lg font-bold text-slate-900">Create Employee</h2>
              </div>
              <div className="mt-6 flex-1">
                <EmployeeForm />
              </div>
            </div>
          </section>

          {/* Right Column: GitHub Mapping */}
          <MappingFocusSection>
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">GitHub Mapping</p>
                <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950">Map synced accounts to employees</h2>
              </div>

              <div className="mt-6 flex-1">
                <MappingForm
                  githubUsers={githubUsers.map((user) => ({
                    id: user.id,
                    githubUsername: user.githubUsername
                  }))}
                  employees={allEmployees.map((employee) => ({
                    id: employee.id,
                    fullName: employee.fullName
                  }))}
                />
              </div>
            </div>
          </MappingFocusSection>
        </div>
      </div>
    </PageShell>
  );
}
