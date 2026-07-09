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

  it("finds nested commands from meaningful command tokens", () => {
    assert.deepEqual(
      getSlashCommandSuggestionMatches("policy").map(
        (suggestion) => suggestion.value,
      ),
      [
        "/demo policy",
        "/demo policy init",
        "/demo policy check",
        "/demo policy edit",
      ],
    );
    assert.equal(
      getSlashCommandSuggestionMatches("policy edit")[0]?.value,
      "/demo policy edit",
    );
    assert.equal(
      getSlashCommandSuggestionMatches("guide save")[0]?.value,
      "/demo guide save-instructions",
    );
  });

  it("matches option names without requiring punctuation", () => {
    const values = getSlashCommandSuggestionMatches("queue all").map(
      (suggestion) => suggestion.value,
    );

    assert(values.includes("/queue stitch --all"));
    assert(values.includes("/queue swipe --all"));
    assert(values.includes("/queue --all"));
  });

  it("keeps setup aliases and nested init commands discoverable", () => {
    const values = getSlashCommandSuggestionMatches("init").map(
      (suggestion) => suggestion.value,
    );

    assert.equal(values[0], "/init");
    assert(values.includes("/demo policy init"));
    assert(values.includes("/native init"));
  });

  it("tolerates one nearby typo in a command token", () => {
    assert.equal(
      getSlashCommandSuggestionMatches("polciy")[0]?.value,
      "/demo policy",
    );
  });

  it("shows subcommands after a completed parent command", () => {
    assert.deepEqual(
      getSlashCommandSuggestionMatches("/demo policy ").map(
        (suggestion) => suggestion.value,
      ),
      [
        "/demo policy init",
        "/demo policy check",
        "/demo policy edit",
      ],
    );
  });
});
