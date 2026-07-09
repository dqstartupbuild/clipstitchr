import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInteractiveTuiIsSupported } from "../../dist/interactiveShell/getInteractiveTuiIsSupported.js";

describe("getInteractiveTuiIsSupported", () => {
  it("uses the TUI in wide interactive terminals", () => {
    assert.equal(
      getInteractiveTuiIsSupported({
        columns: 80,
        isTty: true,
        noColor: false,
        plainEnv: false,
      }),
      true,
    );
  });

  it("uses the default width when a PTY reports zero columns", () => {
    assert.equal(
      getInteractiveTuiIsSupported({
        columns: 0,
        isTty: true,
        noColor: false,
        plain: false,
        plainEnv: false,
      }),
      true,
    );
  });

  it("falls back for plain, no-color, non-interactive, and narrow terminals", () => {
    assert.equal(
      getInteractiveTuiIsSupported({
        columns: 80,
        isTty: true,
        plain: true,
      }),
      false,
    );
    assert.equal(
      getInteractiveTuiIsSupported({
        columns: 80,
        isTty: true,
        noColor: true,
      }),
      false,
    );
    assert.equal(
      getInteractiveTuiIsSupported({
        columns: 80,
        isTty: false,
      }),
      false,
    );
    assert.equal(
      getInteractiveTuiIsSupported({
        columns: 40,
        isTty: true,
      }),
      false,
    );
  });
});
