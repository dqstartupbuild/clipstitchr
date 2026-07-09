import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInteractiveTuiMenuChoices } from "../../dist/interactiveTui/getInteractiveTuiMenuChoices.js";

describe("getInteractiveTuiMenuChoices", () => {
  it("uses the existing shell choices for every persistent menu", () => {
    assert.equal(getInteractiveTuiMenuChoices("main")[0]?.value, "demo");
    assert.equal(getInteractiveTuiMenuChoices("demo")[0]?.value, "manual");
    assert.equal(getInteractiveTuiMenuChoices("products")[0]?.value, "list");
    assert.equal(getInteractiveTuiMenuChoices("queue")[0]?.value, "list");
    assert.equal(getInteractiveTuiMenuChoices("native")[0]?.value, "native-init");
    assert.equal(getInteractiveTuiMenuChoices("account")[0]?.value, "link");
  });
});
