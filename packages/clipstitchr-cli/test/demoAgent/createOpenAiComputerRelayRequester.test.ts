import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createOpenAiComputerRelayRequester } from "../../dist/demoAgent/createOpenAiComputerRelayRequester.js";

const previousFetch = globalThis.fetch;

describe("createOpenAiComputerRelayRequester", () => {
  afterEach(() => {
    globalThis.fetch = previousFetch;
  });

  it("sends the minimal relay body without an OpenAI key", async () => {
    const bodies: unknown[] = [];

    globalThis.fetch = async (url, init) => {
      bodies.push(JSON.parse(String(init?.body)));
      assert.equal(
        String(url),
        "https://clipstitchr.test/api/cli/openai/computer",
      );
      assert.equal(
        new Headers(init?.headers).get("authorization"),
        "Bearer clipstitchr-token",
      );

      return new Response(JSON.stringify({ id: "resp_1", output: [] }), {
        status: 200,
      });
    };

    const requester = createOpenAiComputerRelayRequester({
      credentials: {
        accessToken: "clipstitchr-token",
        apiBaseUrl: "https://clipstitchr.test",
        expiresAt: "2999-01-01T00:00:00.000Z",
        savedAt: "2026-07-09T00:00:00.000Z",
        sessionId: "session_123",
      },
      runId: "run_123",
      runStartedAt: "2026-07-09T00:00:00.000Z",
    });

    const response = await requester({
      input: "Complete the current step.",
      model: "gpt-5.5",
    });

    assert.equal(response.id, "resp_1");
    assert.deepEqual(bodies, [
      {
        callIndex: 1,
        input: "Complete the current step.",
        model: "gpt-5.5",
        runId: "run_123",
        runStartedAt: "2026-07-09T00:00:00.000Z",
      },
    ]);
    assert.equal(JSON.stringify(bodies).includes("OPENAI_API_KEY"), false);
  });
});
