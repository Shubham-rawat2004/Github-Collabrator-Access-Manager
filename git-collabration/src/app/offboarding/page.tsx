import { BulkOffboardingConsole } from "@/components/bulk-offboarding-console";
import { OffboardingRemovalConsole } from "@/components/offboarding-removal-console";
import { PageShell } from "@/components/page-shell";
import { listApprovalRequests } from "@/services/governance-service";
import { listEmployees } from "@/services/employee-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type EmployeeRecord = Awaited<ReturnType<typeof listEmployees>>[number];

function dedupeEmployeesByEmail<
  T extends EmployeeRecord
>(employees: T[]) {
  const seenEmails = new Set<string>();
  const uniqueEmployees: T[] = [];

  for (const employee of employees) {
    const normalizedEmail = employee.email?.trim().toLowerCase();

    if (normalizedEmail) {
      if (seenEmails.has(normalizedEmail)) {
        continue;
      }

      seenEmails.add(normalizedEmail);
    }

    uniqueEmployees.push(employee);
  }

  return uniqueEmployees;
}

export default async function OffboardingPage() {
  const [employees, approvalRequests] = await Promise.all([listEmployees(), listApprovalRequests(50)]);
  const uniqueEmployees = dedupeEmployeesByEmail(employees).filter((employee) =>
    employee.githubUsers.some((user) => user.repositoryAccess.length > 0)
  );
  const bulkApprovalRequests = approvalRequests.filter((request) => request.requestType === "BULK_OFFBOARDING");

  return (
    <PageShell
      title="Access Removal"
      description="Remove a single employee immediately or submit a bulk removal request for approval before execution."
    >
      <div className="grid gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Remove GitHub access safely</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use the single-removal panel for one employee, or create a bulk approval request for multiple employees.
          </p>
        </div>
        <div className="grid gap-6 xl:grid-cols-2 xl:items-stretch">
          <OffboardingRemovalConsole
            employees={uniqueEmployees.map((employee) => ({
              id: employee.id,
              fullName: employee.fullName,
              email: employee.email,
              githubUsers: employee.githubUsers.map((githubUser) => ({
                id: githubUser.id,
                githubUsername: githubUser.githubUsername,
                repositoryAccess: githubUser.repositoryAccess.map((access) => ({
                  repository: {
                    id: access.repository.id,
                    fullName: access.repository.fullName
                  }
                }))
              }))
            }))}
          />

          <div className="h-full">
            <BulkOffboardingConsole
              employees={uniqueEmployees.map((employee) => ({
                id: employee.id,
                fullName: employee.fullName,
                email: employee.email
              }))}
              approvalRequests={bulkApprovalRequests.map((request) => ({
                id: request.id,
                requestType: request.requestType,
                referenceId: request.referenceId,
                status: request.status,
                requestedBy: request.requestedBy,
                approvedBy: request.approvedBy,
                approvedAt: request.approvedAt,
                createdAt: request.createdAt
              }))}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
