import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { captureInteractiveTuiActionOutput } from "../../dist/interactiveTui/captureInteractiveTuiActionOutput.js";

describe("captureInteractiveTuiActionOutput", () => {
  it("retains plain output while returning the action result", async () => {
    let lines: string[] = [];
    const result = await captureInteractiveTuiActionOutput({
      onOutput: (capturedLines) => {
        lines = capturedLines;
      },
      run: async () => {
        console.log("product_123\tClipStitchr");
        return "done";
      },
    });

    assert.equal(result, "done");
    assert.deepEqual(lines, ["product_123\tClipStitchr"]);
  });

  it("restores console output and retains lines when an action fails", async () => {
    const originalLog = console.log;
    let lines: string[] = [];

    await assert.rejects(
      captureInteractiveTuiActionOutput({
        onOutput: (capturedLines) => {
          lines = capturedLines;
        },
        run: async () => {
          console.warn("Trying the request");
          throw new Error("Request failed");
        },
      }),
      /Request failed/,
    );

    assert.equal(console.log, originalLog);
    assert.deepEqual(lines, ["Trying the request"]);
  });
});
