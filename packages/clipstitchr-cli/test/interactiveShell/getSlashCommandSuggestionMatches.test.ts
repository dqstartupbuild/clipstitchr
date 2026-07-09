import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSlashCommandSuggestionMatches } from "../../dist/interactiveShell/getSlashCommandSuggestionMatches.js";

describe("getSlashCommandSuggestionMatches", () => {
  it("suggests top-level slash commands before the user types", () => {
    const values = getSlashCommandSuggestionMatches(undefined).map(
      (suggestion) => suggestion.value,
    );

    assert(values.includes("/demo"));
    assert(values.includes("/queue"));
    assert(values.includes("/products"));
    assert(values.includes("/stitchr"));
  });

  it("keeps the first slash focused on top-level commands", () => {
    const values = getSlashCommandSuggestionMatches("/").map(
      (suggestion) => suggestion.value,
    );

    assert(values.includes("/demo"));
    assert(values.includes("/queue"));
    assert(!values.includes("/demo manual"));
  });

  it("matches command and subcommand prefixes", () => {
    assert.deepEqual(
      getSlashCommandSuggestionMatches("/demo guide s").map(
        (suggestion) => suggestion.value,
      ),
      ["/demo guide show", "/demo guide save-instructions"],
    );
  });

  it("matches option prefixes", () => {
    assert.deepEqual(
      getSlashCommandSuggestionMatches("/stitchr new --t").map(
        (suggestion) => suggestion.value,
      ),
      ["/stitchr new --template", "/stitchr new --time-zone"],
    );
  });

  it("matches even when the user omits the leading slash", () => {
    assert.deepEqual(
      getSlashCommandSuggestionMatches("queue s").map(
        (suggestion) => suggestion.value,
      ),
      [
        "/queue stitch",
        "/queue stitch --all",
        "/queue stitch --product",
        "/queue swipe",
        "/queue swipe --all",
        "/queue swipe --product",
      ],
    );
  });
});
