import { prisma } from "@/lib/prisma";

async function recoverOrphanedSyncJobs() {
  const runningJobs = await prisma.syncJob.findMany({
    where: { status: "RUNNING" }
  });

  if (runningJobs.length === 0) {
    return;
  }

  await prisma.syncJob.updateMany({
    where: { status: "RUNNING" },
    data: {
      status: "FAILED",
      errorMessage: "Sync interrupted by application restart",
      completedAt: new Date()
    }
  });
}

export async function ensureApplicationInitialized() {
  await recoverOrphanedSyncJobs();
}
