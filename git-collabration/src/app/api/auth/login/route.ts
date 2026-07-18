import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin credentials are not configured." }, { status: 500 });
  }

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "invalid");
    if (from.startsWith("/")) {
      loginUrl.searchParams.set("from", from);
    }
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(from.startsWith("/") ? from : "/", request.url));
  response.cookies.set("gcam_session", createSessionToken({ username, role: "ADMIN" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  response.cookies.delete("gcam_sync_done");
  return response;
}
