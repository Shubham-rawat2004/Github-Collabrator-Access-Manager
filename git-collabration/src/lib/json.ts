export function toJsonSafe<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (typeof value === "bigint") {
    return value.toString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonSafe(item)) as T;
  }

  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, toJsonSafe(entry)])) as T;
  }

  return value;
}
