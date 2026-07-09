import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createProductsMenuChoices } from "../../dist/productsMenu/createProductsMenuChoices.js";

describe("createProductsMenuChoices", () => {
  it("shows focused products actions", () => {
    assert.deepEqual(
      createProductsMenuChoices().map((choice) => choice.name),
      [
        "Show my products",
        "Create a product",
        "Use a product for this repo",
      ],
    );
  });
});
