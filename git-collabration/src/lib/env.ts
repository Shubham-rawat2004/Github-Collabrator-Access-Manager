import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5433/git_collabration?schema=public"),
  GITHUB_PAT: z.string().optional().default(""),
  GITHUB_OWNER: z.string().optional().default(""),
  SESSION_SECRET: z.string().min(1).default("replace-with-a-long-random-string"),
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(1).default("change-me"),
  SPRING_BOOT_URL: z.string().min(1).default("http://localhost:8080")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL || undefined,
  GITHUB_PAT: process.env.GITHUB_PAT || undefined,
  GITHUB_OWNER: process.env.GITHUB_OWNER || undefined,
  SESSION_SECRET: process.env.SESSION_SECRET || undefined,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || undefined,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || undefined,
  SPRING_BOOT_URL: process.env.SPRING_BOOT_URL || undefined
});

