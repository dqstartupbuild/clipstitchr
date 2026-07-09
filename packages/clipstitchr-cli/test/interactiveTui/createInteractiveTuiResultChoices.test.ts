import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInteractiveTuiResultChoices } from "../../dist/interactiveTui/createInteractiveTuiResultChoices.js";

describe("createInteractiveTuiResultChoices", () => {
  it("returns to the originating menu or another top-level destination", () => {
    assert.deepEqual(
      createInteractiveTuiResultChoices("products").map((choice) => ({
        name: choice.name,
        value: choice.value,
      })),
      [
        { name: "Back to Products", value: "result:back" },
        { name: "Main menu", value: "nav:main" },
        { name: "Type a slash command", value: "nav:slash" },
        { name: "Exit", value: "nav:exit" },
      ],
    );
  });

  it("does not duplicate the main-menu destination", () => {
    assert.deepEqual(
      createInteractiveTuiResultChoices("main").map((choice) => choice.value),
      ["result:back", "nav:slash", "nav:exit"],
    );
  });
});
