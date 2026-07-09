import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSlashCommandSearchChoices } from "../../dist/interactiveShell/createSlashCommandSearchChoices.js";

describe("createSlashCommandSearchChoices", () => {
  it("returns search choices with descriptions", () => {
    assert.deepEqual(createSlashCommandSearchChoices("/products u"), [
      {
        description: "Use a product for this repo",
        name: "/products use",
        value: "/products use",
      },
    ]);
  });

  it("keeps a typed command with values runnable", () => {
    assert.deepEqual(createSlashCommandSearchChoices("/products use product_123"), [
      {
        description: "Run exactly what you typed",
        name: "/products use product_123",
        value: "/products use product_123",
      },
    ]);
  });
});
