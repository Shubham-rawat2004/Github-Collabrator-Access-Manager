import { env } from "@/lib/env";

function getSpringUrl(): string {
  const rawUrl = (env.SPRING_BOOT_URL || "http://localhost:8080").trim();

  // If Render internal service name was used without protocol/port
  if (rawUrl === "gcam-backend" || rawUrl === "http://gcam-backend") {
    return "https://gcam-backend.onrender.com";
  }

  const withProto =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `http://${rawUrl}`;

  return withProto.replace(/\/+$/, "");
}

export async function fetchBackend<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getSpringUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${baseUrl}${normalizedPath}`;

  const response = await fetch(fullUrl, {
    cache: "no-store",
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
