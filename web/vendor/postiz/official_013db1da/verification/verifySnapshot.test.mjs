import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { verifySnapshot } from "./verifySnapshot.mjs";

const snapshotDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

it("verifies every vendored Postiz file against the immutable manifest", async () => {
  await expect(verifySnapshot(snapshotDirectory)).resolves.toEqual({
    fileCount: 929,
    manifestSha256:
      "ce69e41feb70f7453520f95f3de538813958833c894582cf755eb1322473ecc7",
    snapshotVersion: "013db1da",
  });
});
