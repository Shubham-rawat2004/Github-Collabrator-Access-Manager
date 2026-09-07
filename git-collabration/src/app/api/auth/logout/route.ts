import { NextResponse } from "next/server";

function getBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  const baseUrl = getBaseUrl(request);
  const response = NextResponse.redirect(new URL("/login", baseUrl));
  response.cookies.set("gcam_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  response.cookies.delete("gcam_sync_done");
  return response;
}
