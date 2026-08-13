import { Prisma } from "@prisma/client";

export const isPrismaUniqueConstraintError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";
