import { afterEach, describe, expect, it, vi } from "vitest";
import { getCliDemoAgentPlannerModelId } from "@/lib/clipstitchr/server/getCliDemoAgentPlannerModelId";

describe("getCliDemoAgentPlannerModelId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to GPT-5 mini when no planner override is set", () => {
    vi.stubEnv("CLI_DEMO_AGENT_PLANNER_MODEL_ID", "");

    expect(getCliDemoAgentPlannerModelId()).toBe("openai/gpt-5-mini");
  });

  it("uses the dedicated planner override", () => {
    vi.stubEnv("CLI_DEMO_AGENT_PLANNER_MODEL_ID", "openai/gpt-5.1-mini");

    expect(getCliDemoAgentPlannerModelId()).toBe("openai/gpt-5.1-mini");
  });

  it("ignores placeholder values", () => {
    vi.stubEnv("CLI_DEMO_AGENT_PLANNER_MODEL_ID", "PLACEHOLDER");

    expect(getCliDemoAgentPlannerModelId()).toBe("openai/gpt-5-mini");
  });
});
