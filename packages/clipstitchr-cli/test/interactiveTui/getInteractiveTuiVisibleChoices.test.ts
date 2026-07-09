import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInteractiveTuiVisibleChoices } from "../../dist/interactiveTui/getInteractiveTuiVisibleChoices.js";

describe("getInteractiveTuiVisibleChoices", () => {
  it("keeps the selected choice inside a bounded menu window", () => {
    const visible = getInteractiveTuiVisibleChoices({
      choices: Array.from({ length: 15 }, (_, index) => ({
        name: `Choice ${index}`,
        value: `choice-${index}`,
      })),
      maximumVisibleChoices: 5,
      selectedIndex: 10,
    });

    assert.equal(visible.choices.length, 5);
    assert.equal(visible.choices[visible.selectedIndex]?.value, "choice-10");
    assert.equal(visible.hasMoreAbove, true);
    assert.equal(visible.hasMoreBelow, true);
  });
});
