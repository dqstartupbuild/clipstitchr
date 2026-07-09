import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSlashCommandLine } from "../../dist/interactiveShell/parseSlashCommandLine.js";

describe("parseSlashCommandLine", () => {
  it("splits quoted slash commands", () => {
    assert.deepEqual(
      parseSlashCommandLine('/demo agent --guide "upload flow" --no-upload'),
      ["demo", "agent", "--guide", "upload flow", "--no-upload"],
    );
  });

  it("requires a slash prefix", () => {
    assert.throws(
      () => parseSlashCommandLine("demo manual"),
      /Start slash commands with \//,
    );
  });

  it("rejects open quotes", () => {
    assert.throws(
      () => parseSlashCommandLine('/demo agent --guide "upload flow'),
      /Close the quote/,
    );
  });
});
