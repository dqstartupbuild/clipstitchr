import { afterEach, describe, expect, it, vi } from "vitest";
import { getTextWritingModelId } from "@/lib/clipstitchr/server/getTextWritingModelId";

describe("getTextWritingModelId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to Claude Sonnet 4.6 when no writing model override is set", () => {
    vi.stubEnv("TEXT_WRITING_MODEL_ID", "");
    vi.stubEnv("CLIPR_HOOK_MODEL_ID", "");

    expect(getTextWritingModelId()).toBe("anthropic/claude-sonnet-4.6");
  });

  it("prefers the general writing model override", () => {
    vi.stubEnv("TEXT_WRITING_MODEL_ID", "anthropic/claude-opus-4.6");
    vi.stubEnv("CLIPR_HOOK_MODEL_ID", "openai/gpt-4.1");

    expect(getTextWritingModelId()).toBe("anthropic/claude-opus-4.6");
  });

  it("keeps the legacy Clipr hook model override as a fallback", () => {
    vi.stubEnv("TEXT_WRITING_MODEL_ID", "PLACEHOLDER");
    vi.stubEnv("CLIPR_HOOK_MODEL_ID", "anthropic/claude-sonnet-4.6");

    expect(getTextWritingModelId()).toBe("anthropic/claude-sonnet-4.6");
  });
});
