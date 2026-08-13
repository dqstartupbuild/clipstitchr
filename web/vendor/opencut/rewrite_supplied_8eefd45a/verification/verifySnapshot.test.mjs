import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { verifySnapshot } from "./verifySnapshot.mjs";

const snapshotDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

it("verifies every supplied OpenCut rewrite file against the manifest", async () => {
  await expect(verifySnapshot(snapshotDirectory)).resolves.toEqual({
    fileCount: 127,
    manifestSha256:
      "79b88f98506e83debf245a4dd66ba019f93e1dff2243fbb8238de8eb1a3632e5",
    snapshotVersion: "rewrite-supplied-8eefd45a",
  });
});
