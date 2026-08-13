import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { verifySnapshot } from "./verifySnapshot.mjs";

const snapshotDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

it("verifies every vendored LazyReel file against the immutable manifest", async () => {
  await expect(verifySnapshot(snapshotDirectory)).resolves.toEqual({
    fileCount: 120,
    manifestSha256:
      "071ec70d9de377347767a6215df9ac849db46cf287203966800cf8abe85de356",
    snapshotVersion: "0.1.0",
  });
});

