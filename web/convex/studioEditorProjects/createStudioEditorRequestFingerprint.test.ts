import { describe, expect, it } from "vitest";
import { createStudioEditorRequestFingerprint } from "./createStudioEditorRequestFingerprint";

describe("createStudioEditorRequestFingerprint", () => {
  it("returns deterministic SHA-256 fingerprints that change with the exact request", async () => {
    const first = await createStudioEditorRequestFingerprint("snapshot one");
    const retry = await createStudioEditorRequestFingerprint("snapshot one");
    const changed = await createStudioEditorRequestFingerprint("snapshot two");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(retry).toBe(first);
    expect(changed).not.toBe(first);
  });
});
