import { describe, expect, it, vi } from "vitest";
import { createStudioClipsTestClaim } from "../../testing/createStudioClipsTestClaim";
import { createStudioClipsAnalysisProvider } from "./createStudioClipsAnalysisProvider";

describe("createStudioClipsAnalysisProvider", () => {
  it("uses OpenAI structured output and returns only validated source spans", async () => {
    const request = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("authorization")).toBe(
        "Bearer openai-secret",
      );
      const body = JSON.parse(String(init?.body));
      expect(body.response_format.json_schema.strict).toBe(true);
      expect(body.messages[1].content).toContain("[00:00:00.000 - 00:00:20.000]");
      return Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                brollOpportunities: [],
                candidates: [
                  {
                    endSeconds: 20,
                    reasoning: ["The source opens with a specific claim."],
                    score: {
                      clarity: 91,
                      hook: 88,
                      overall: 90,
                      retention: 89,
                      shareability: 86,
                    },
                    startSeconds: 0,
                    title: "Specific claim",
                  },
                ],
                summary: "One grounded candidate.",
              }),
            },
          },
        ],
      });
    });
    const provider = createStudioClipsAnalysisProvider({
      config: { apiKey: "openai-secret", model: "gpt-test", provider: "openai" },
      fetch: request as typeof fetch,
    });

    await expect(
      provider.analyze({
        claim: createStudioClipsTestClaim(),
        durationSeconds: 30,
        transcript: "[00:00:00.000 - 00:00:20.000] A concrete spoken claim.",
      }),
    ).resolves.toMatchObject({
      payload: {
        candidates: [{ endSeconds: 20, id: "candidate-1", startSeconds: 0 }],
        schemaVersion: "studio-clips-analysis-v1",
        transcriptExcerpts: [
          { endSeconds: 20, startSeconds: 0, text: "A concrete spoken claim." },
        ],
      },
      snapshotVersion: 1,
    });
  });
});
