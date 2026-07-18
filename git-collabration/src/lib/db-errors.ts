type PrismaLikeError = Error & {
  code?: string;
};

export function isDatabaseUnavailableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const prismaError = error as PrismaLikeError;

  return (
    error.name === "PrismaClientInitializationError" ||
    prismaError.code === "P1000" ||
    prismaError.code === "P1001" ||
    prismaError.code === "P1017"
  );
}
