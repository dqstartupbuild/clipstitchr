import { afterEach, describe, expect, it, vi } from "vitest";
import { getCliDemoGuideModelId } from "@/lib/clipstitchr/server/getCliDemoGuideModelId";

describe("getCliDemoGuideModelId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to GPT-5 mini when no guide override is set", () => {
    vi.stubEnv("CLI_DEMO_GUIDE_MODEL_ID", "");

    expect(getCliDemoGuideModelId()).toBe("openai/gpt-5-mini");
  });

  it("uses the dedicated guide override", () => {
    vi.stubEnv("CLI_DEMO_GUIDE_MODEL_ID", "openai/gpt-5.1-mini");

    expect(getCliDemoGuideModelId()).toBe("openai/gpt-5.1-mini");
  });

  it("ignores placeholder values", () => {
    vi.stubEnv("CLI_DEMO_GUIDE_MODEL_ID", "PLACEHOLDER");

    expect(getCliDemoGuideModelId()).toBe("openai/gpt-5-mini");
  });
});
