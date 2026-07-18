import { env } from "@/lib/env";

const SPRING_BOOT_URL = env.SPRING_BOOT_URL || "http://localhost:8080";

export async function fetchBackend<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SPRING_BOOT_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Backend request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
