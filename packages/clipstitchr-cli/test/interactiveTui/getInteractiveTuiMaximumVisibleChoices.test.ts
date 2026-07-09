import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInteractiveTuiMaximumVisibleChoices } from "../../dist/interactiveTui/getInteractiveTuiMaximumVisibleChoices.js";

describe("getInteractiveTuiMaximumVisibleChoices", () => {
  it("reserves terminal rows for the header and controls", () => {
    assert.equal(getInteractiveTuiMaximumVisibleChoices(16), 6);
    assert.equal(getInteractiveTuiMaximumVisibleChoices(18), 8);
    assert.equal(getInteractiveTuiMaximumVisibleChoices(24), 9);
    assert.equal(getInteractiveTuiMaximumVisibleChoices(40), 9);
  });

  it("keeps one choice visible in very short terminals", () => {
    assert.equal(getInteractiveTuiMaximumVisibleChoices(10), 1);
  });
});
