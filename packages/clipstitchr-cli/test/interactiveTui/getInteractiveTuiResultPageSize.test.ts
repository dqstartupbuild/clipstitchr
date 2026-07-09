import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInteractiveTuiResultPageSize } from "../../dist/interactiveTui/getInteractiveTuiResultPageSize.js";

describe("getInteractiveTuiResultPageSize", () => {
  it("uses remaining terminal rows without hiding the header", () => {
    assert.equal(getInteractiveTuiResultPageSize(18), 5);
    assert.equal(getInteractiveTuiResultPageSize(24), 10);
    assert.equal(getInteractiveTuiResultPageSize(40), 10);
  });
});
