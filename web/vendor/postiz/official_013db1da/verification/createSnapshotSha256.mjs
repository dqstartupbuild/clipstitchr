import { createHash } from "node:crypto";

export const createSnapshotSha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
