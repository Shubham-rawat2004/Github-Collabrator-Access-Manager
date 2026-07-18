import crypto from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const SESSION_COOKIE = "gcam_session";

function getSecret() {
  if (!env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required for authentication.");
  }

  return env.SESSION_SECRET;
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export type AuthSession = {
  username: string;
  role: "ADMIN" | "VIEWER";
};

export function createSessionToken(session: AuthSession) {
  const payload = base64Url(JSON.stringify(session));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string | null): AuthSession | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  if (signature.length !== expectedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthSession;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
