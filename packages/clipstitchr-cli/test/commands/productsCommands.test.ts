import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCliOutput } from "./readCliOutput.js";

describe("products commands", () => {
  it("keeps direct product commands available", () => {
    const output = readCliOutput(["products", "--help"]);

    assert.match(output, /list\s+List saved products/);
    assert.match(output, /create \[options\]\s+Create a new product/);
    assert.match(output, /use \[productId\]\s+Choose the product this repo records/);
  });
});
