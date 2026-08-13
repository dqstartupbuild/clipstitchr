import { createHash } from "node:crypto";

export const createSupoclipSnapshotSha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
