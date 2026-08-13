import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { verifySnapshot } from "./verifySnapshot.mjs";

const snapshotDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

it("verifies every vendored ReelClaw file against the immutable manifest", async () => {
  await expect(verifySnapshot(snapshotDirectory)).resolves.toEqual({
    fileCount: 14,
    manifestSha256:
      "bdeb17cac41fd8040a39a32f660f336c1a6e5d608125efb1043b924ab9f4f426",
    snapshotVersion: "bdeb17ca",
  });
});

