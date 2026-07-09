import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInteractiveTuiContextText } from "../../dist/interactiveTui/getInteractiveTuiContextText.js";

describe("getInteractiveTuiContextText", () => {
  it("keeps local workspace context concise", () => {
    assert.equal(
      getInteractiveTuiContextText({
        isAccountConnected: true,
        isRepoLinked: true,
        productLabel: "A product name that is much too long for the header",
      }),
      "Product: A product name that is mu... | Repo: linked | Account: connected",
    );
  });
});
