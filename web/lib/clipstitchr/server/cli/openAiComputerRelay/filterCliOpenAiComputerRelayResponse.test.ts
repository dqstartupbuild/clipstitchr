import { describe, expect, it } from "vitest";
import { filterCliOpenAiComputerRelayResponse } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/filterCliOpenAiComputerRelayResponse";

describe("filterCliOpenAiComputerRelayResponse", () => {
  it("returns only the response id and computer calls", () => {
    const response = filterCliOpenAiComputerRelayResponse({
      id: "resp_123",
      metadata: {
        apiKey: "sk-server-secret",
      },
      output: [
        {
          actions: [{ type: "wait" }],
          call_id: "call_123",
          type: "computer_call",
        },
        {
          content: [{ text: "Done", type: "output_text" }],
          type: "message",
        },
      ],
    });

    expect(response).toEqual({
      id: "resp_123",
      output: [
        {
          actions: [{ type: "wait" }],
          call_id: "call_123",
          type: "computer_call",
        },
      ],
    });
    expect(JSON.stringify(response)).not.toContain("sk-server-secret");
  });
});
