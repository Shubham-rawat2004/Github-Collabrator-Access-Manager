import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { env } from "@/lib/env";

function getBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");
  const baseUrl = getBaseUrl(request);

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", "unconfigured");
    if (from.startsWith("/")) {
      loginUrl.searchParams.set("from", from);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", "invalid");
    if (from.startsWith("/")) {
      loginUrl.searchParams.set("from", from);
    }
    return NextResponse.redirect(loginUrl);
  }

  const targetPath = from.startsWith("/") ? from : "/";
  const response = NextResponse.redirect(new URL(targetPath, baseUrl));
  response.cookies.set("gcam_session", createSessionToken({ username, role: "ADMIN" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  response.cookies.delete("gcam_sync_done");
  return response;
}
