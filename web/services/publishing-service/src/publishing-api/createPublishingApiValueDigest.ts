import { createHash } from "node:crypto";

export const createPublishingApiValueDigest = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
