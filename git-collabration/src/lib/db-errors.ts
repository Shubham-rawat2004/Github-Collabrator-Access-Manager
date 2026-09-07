type PrismaLikeError = Error & {
  code?: string;
};

export function isDatabaseUnavailableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const prismaError = error as PrismaLikeError;
  const msg = error.message.toLowerCase();

  return (
    error.name === "PrismaClientInitializationError" ||
    prismaError.code === "P1000" ||
    prismaError.code === "P1001" ||
    prismaError.code === "P1017" ||
    msg.includes("backend request failed") ||
    msg.includes("fetch failed") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound")
  );
}
