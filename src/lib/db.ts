import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Whether persistent server-side storage is available in this deployment. */
export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

/**
 * A single Prisma client for the process. Calling code must check
 * `isDatabaseConfigured` before a query so local preview builds fail cleanly.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export class DatabaseUnavailableError extends Error {
  code = "DATABASE_UNAVAILABLE" as const;

  constructor() {
    super("Persistent storage is not configured for this deployment.");
    this.name = "DatabaseUnavailableError";
  }
}

export function requireDatabase() {
  if (!isDatabaseConfigured) throw new DatabaseUnavailableError();
  return db;
}

export function isDatabaseUnavailable(error: unknown) {
  return error instanceof DatabaseUnavailableError;
}
