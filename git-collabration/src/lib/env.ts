import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  GITHUB_PAT: z.string().optional(),
  GITHUB_OWNER: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  SPRING_BOOT_URL: z.string().optional()
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  GITHUB_PAT: process.env.GITHUB_PAT,
  GITHUB_OWNER: process.env.GITHUB_OWNER,
  SESSION_SECRET: process.env.SESSION_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SPRING_BOOT_URL: process.env.SPRING_BOOT_URL
});

