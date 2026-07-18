import { prisma } from "../src/lib/prisma";

async function main() {
  const existing = await prisma.employee.findFirst({
    where: { fullName: "Avery Admin" }
  });

  if (existing) {
    return;
  }

  await prisma.employee.create({
    data: {
      fullName: "Avery Admin",
      email: "avery.admin@example.com",
      department: "Platform"
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
