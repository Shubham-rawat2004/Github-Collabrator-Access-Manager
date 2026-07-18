import { NextResponse } from "next/server";
import { removeEmployeeAccess } from "@/services/offboarding-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      employeeId?: string;
      executedBy?: string;
    };

    if (!body.employeeId?.trim()) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const result = await removeEmployeeAccess(body.employeeId, body.executedBy ?? "admin");
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to remove employee access"
      },
      { status: 400 }
    );
  }
}
