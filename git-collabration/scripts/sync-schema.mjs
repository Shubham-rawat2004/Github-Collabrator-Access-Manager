import { execFileSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not set; skipping Prisma db push.");
  process.exit(0);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";

execFileSync(command, ["prisma", "db", "push"], {
  stdio: "inherit"
});
