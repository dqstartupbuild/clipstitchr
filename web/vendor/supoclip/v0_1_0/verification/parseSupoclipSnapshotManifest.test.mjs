import { expect, it } from "vitest";
import { parseSupoclipSnapshotManifest } from "./parseSupoclipSnapshotManifest.mjs";

const digest = "a".repeat(64);

it("rejects duplicate and boundary-escaping SupoClip manifest paths", () => {
  expect(() =>
    parseSupoclipSnapshotManifest(`${digest}  ../secret\n`, "/tmp/upstream"),
  ).toThrow("Unsafe SupoClip SHA256SUMS path");

  expect(() =>
    parseSupoclipSnapshotManifest(`${digest}  /tmp/secret\n`, "/tmp/upstream"),
  ).toThrow("Unsafe SupoClip SHA256SUMS path");

  expect(() =>
    parseSupoclipSnapshotManifest(
      `${digest}  README.md\n${digest}  README.md\n`,
      "/tmp/upstream",
    ),
  ).toThrow("Duplicate SupoClip SHA256SUMS path");
});
