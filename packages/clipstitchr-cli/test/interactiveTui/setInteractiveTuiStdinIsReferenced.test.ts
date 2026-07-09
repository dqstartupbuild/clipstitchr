import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setInteractiveTuiStdinIsReferenced } from "../../dist/interactiveTui/setInteractiveTuiStdinIsReferenced.js";

describe("setInteractiveTuiStdinIsReferenced", () => {
  it("keeps delegated prompt input alive until the TUI exits", () => {
    const calls: string[] = [];
    const stdin = {
      isTTY: true,
      ref: () => calls.push("ref"),
      resume: () => calls.push("resume"),
      unref: () => calls.push("unref"),
    };

    setInteractiveTuiStdinIsReferenced({ isReferenced: true, stdin });
    setInteractiveTuiStdinIsReferenced({ isReferenced: false, stdin });

    assert.deepEqual(calls, ["ref", "resume", "unref"]);
  });

  it("leaves non-TTY input unchanged", () => {
    const calls: string[] = [];

    setInteractiveTuiStdinIsReferenced({
      isReferenced: true,
      stdin: {
        isTTY: false,
        ref: () => calls.push("ref"),
        resume: () => calls.push("resume"),
        unref: () => calls.push("unref"),
      },
    });

    assert.deepEqual(calls, []);
  });
});
