import assert from "node:assert/strict";
import type { DemoAgentActionLogEntry } from "../../src/demoAgent/DemoAgentActionLogEntry.js";

export function assertDemoAgentTestEntriesIncludeUrls(
  entries: DemoAgentActionLogEntry[],
) {
  for (const entry of entries) {
    assert.equal(typeof entry.details?.urlBefore, "string");
    assert.equal(typeof entry.details?.urlAfter, "string");
  }
}
