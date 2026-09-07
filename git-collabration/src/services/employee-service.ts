import { fetchBackend } from "@/lib/backend";
import { Employee, GithubUser, RepositoryAccess, Repository } from "@prisma/client";

export type EmployeeWithRelations = Employee & {
  githubUsers: Array<GithubUser & {
    repositoryAccess: Array<RepositoryAccess & {
      repository: Repository;
    }>;
  }>;
};

export async function listEmployees(search = ""): Promise<EmployeeWithRelations[]> {
  try {
    const result = await fetchBackend<{ employees: EmployeeWithRelations[] }>(`/api/employees?q=${encodeURIComponent(search)}`);
    return result.employees ?? [];
  } catch (error) {
    console.error("Failed to list employees:", error);
    return [];
  }
}

export async function getEmployeeById(id: string): Promise<EmployeeWithRelations | null> {
  try {
    return await fetchBackend<EmployeeWithRelations | null>(`/api/employees/${id}`);
  } catch (error) {
    console.error(`Failed to fetch employee ${id}:`, error);
    return null;
  }
}

export async function createEmployee(input: {
  fullName: string;
  email?: string | null;
}): Promise<Employee> {
  const result = await fetchBackend<{ employee: Employee }>("/api/employees", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return result.employee;
}

export async function updateEmployee(
  id: string,
  input: {
    fullName?: string;
    email?: string | null;
    department?: string | null;
    notes?: string | null;
    isActive?: boolean;
  }
): Promise<Employee> {
  const result = await fetchBackend<{ employee: Employee }>(`/api/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
  return result.employee;
}

export async function deleteEmployee(id: string): Promise<Employee> {
  return fetchBackend<Employee>(`/api/employees/${id}`, {
    method: "DELETE"
  });
}

export async function mapGithubUserToEmployee(githubUserId: string, employeeId: string | null): Promise<GithubUser> {
  const result = await fetchBackend<{ githubUser: GithubUser }>("/api/github-users/mapping", {
    method: "POST",
    body: JSON.stringify({ githubUserId, employeeId })
  });
  return result.githubUser;
}
