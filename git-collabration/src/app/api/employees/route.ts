import { NextResponse } from "next/server";
import { createEmployee, listEmployees } from "@/services/employee-service";
import { recordAuditEvent } from "@/services/audit-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const employees = await listEmployees(q);
  return NextResponse.json({
    employees: employees.map((employee) => ({
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department,
      isActive: employee.isActive,
      notes: employee.notes,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    }))
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
    };

    if (!body.fullName?.trim()) {
      return NextResponse.json({ error: "fullName is required" }, { status: 400 });
    }

    const employee = await createEmployee({
      fullName: body.fullName.trim(),
      email: body.email?.trim() || null
    });

    await recordAuditEvent({
      actionType: "EMPLOYEE_CREATED",
      entityType: "employees",
      entityId: employee.id,
      performedBy: "admin",
      details: {
        fullName: employee.fullName
      }
    });

    return NextResponse.json(
      {
        employee: {
          id: employee.id,
          fullName: employee.fullName,
          email: employee.email,
          department: employee.department,
          isActive: employee.isActive,
          notes: employee.notes,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create employee"
      },
      { status: 400 }
    );
  }
}
