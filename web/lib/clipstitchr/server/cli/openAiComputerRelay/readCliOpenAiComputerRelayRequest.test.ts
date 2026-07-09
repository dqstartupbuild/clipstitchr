import { describe, expect, it } from "vitest";
import { readCliOpenAiComputerRelayRequest } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/readCliOpenAiComputerRelayRequest";

function createBody() {
  return {
    callIndex: 1,
    input: "Complete the current guide step.",
    model: "gpt-5.5",
    runId: "run_123",
    runStartedAt: new Date().toISOString(),
  };
}

describe("readCliOpenAiComputerRelayRequest", () => {
  it("accepts the initial task prompt", () => {
    expect(readCliOpenAiComputerRelayRequest(createBody())).toEqual(
      expect.objectContaining({
        callIndex: 1,
        input: "Complete the current guide step.",
        model: "gpt-5.5",
        runId: "run_123",
      }),
    );
  });

  it("accepts one capped screenshot output", () => {
    expect(
      readCliOpenAiComputerRelayRequest({
        ...createBody(),
        input: [
          {
            call_id: "call_123",
            output: {
              detail: "original",
              image_url: `data:image/png;base64,${Buffer.from("png").toString("base64")}`,
              type: "computer_screenshot",
            },
            type: "computer_call_output",
          },
        ],
        previousResponseId: "resp_123",
      }),
    ).toEqual(
      expect.objectContaining({
        previousResponseId: "resp_123",
      }),
    );
  });

  it("rejects run call indexes over the relay cap", () => {
    expect(() =>
      readCliOpenAiComputerRelayRequest({
        ...createBody(),
        callIndex: 81,
      }),
    ).toThrow(/limited to 80 calls/);
  });

  it("rejects oversized task prompts", () => {
    expect(() =>
      readCliOpenAiComputerRelayRequest({
        ...createBody(),
        input: "x".repeat(20001),
      }),
    ).toThrow(/too long/);
  });
});
