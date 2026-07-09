import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDamerauLevenshteinDistance } from "../../dist/interactiveShell/getDamerauLevenshteinDistance.js";

describe("getDamerauLevenshteinDistance", () => {
  it("counts an adjacent transposition as one edit", () => {
    assert.equal(getDamerauLevenshteinDistance("polciy", "policy"), 1);
  });
});
