import { afterEach, describe, expect, it, vi } from "vitest";
import type { CliDemoAgentPlanRequest } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlanRequest";
import { createCliDemoAgentPlannerGeneration } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/createCliDemoAgentPlannerGeneration";

type CreateGenerationInput = Parameters<
  typeof createCliDemoAgentPlannerGeneration
>[0];

function createRequest(): CliDemoAgentPlanRequest {
  return {
    approvedTestValueKeys: ["testEmail"],
    approvedUploadFileKeys: [],
    attemptedActionKeys: [],
    guide: {
      goal: "Demonstrate running a batch Stitch in Stitchr.",
      steps: [
        {
          id: "step-1",
          label: "Open Stitchr",
        },
      ],
      title: "Batch Stitch demo",
    },
    observation: {
      buttons: [],
      dialogs: [],
      headings: [{ name: "Dashboard", role: "heading" }],
      inputs: [],
      links: [{ name: "Library", role: "link" }],
      title: "Dashboard",
      url: "http://localhost:3000/dashboard",
    },
    step: {
      id: "step-1",
      label: "Open Library",
    },
  };
}

describe("createCliDemoAgentPlannerGeneration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the dedicated GPT-5 mini planner model by default", async () => {
    vi.stubEnv("CLI_DEMO_AGENT_PLANNER_MODEL_ID", "");

    const createPrediction = vi.fn().mockResolvedValue({
      id: "prediction_123",
    });
    const wait = vi.fn().mockResolvedValue({
      output: JSON.stringify({
        reason: "The Library link is visible.",
        stepId: "step-1",
        target: { name: "Library", role: "link" },
        type: "click",
      }),
      status: "succeeded",
    });
    const replicate = {
      predictions: {
        create: createPrediction,
      },
      wait,
    } as unknown as CreateGenerationInput["replicate"];

    const generation = await createCliDemoAgentPlannerGeneration({
      replicate,
      request: createRequest(),
    });

    expect(generation.providerModel).toBe("openai/gpt-5-mini");
    expect(generation.action.type).toBe("click");
    expect(createPrediction).toHaveBeenCalledWith({
      input: expect.objectContaining({
        max_completion_tokens: 500,
        prompt: expect.any(String),
        system_prompt: expect.any(String),
      }),
      model: "openai/gpt-5-mini",
    });
    expect(createPrediction.mock.calls[0]?.[0].input).not.toHaveProperty(
      "max_tokens",
    );
  });
});
