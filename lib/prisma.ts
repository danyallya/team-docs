import "server-only";
import { PrismaClient } from "@prisma/client";
import { localSqliteTarget } from "@/scripts/sqlite-target.mjs";
const databaseUrl = localSqliteTarget(process.env.DATABASE_URL ?? "file:./forma-dev.db").url;
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient({ datasourceUrl: databaseUrl });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
