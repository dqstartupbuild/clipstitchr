import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interactiveTuiActiveEnvironmentVariable } from "../../dist/config/interactiveTuiActiveEnvironmentVariable.js";
import { logBrandHeader } from "../../dist/terminal/logBrandHeader.js";

describe("logBrandHeader", () => {
  it("avoids repeating the brand inside the persistent TUI", () => {
    const logs: string[] = [];
    const originalLog = console.log;
    const previousValue = process.env[interactiveTuiActiveEnvironmentVariable];

    try {
      process.env[interactiveTuiActiveEnvironmentVariable] = "1";
      console.log = (message = "") => logs.push(String(message));
      logBrandHeader("Setup status");
    } finally {
      console.log = originalLog;

      if (previousValue === undefined) {
        delete process.env[interactiveTuiActiveEnvironmentVariable];
      } else {
        process.env[interactiveTuiActiveEnvironmentVariable] = previousValue;
      }
    }

    assert.equal(logs.some((line) => line.includes("ClipStitchr")), false);
    assert.equal(logs.some((line) => line.includes("Setup status")), true);
  });
});
