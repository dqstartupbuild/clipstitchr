import { describe, expect, it } from "vitest";
import { getStudioStitchProviderLabel } from "./getStudioStitchProviderLabel";

describe("getStudioStitchProviderLabel", () => {
  it("uses readable provider names", () => {
    expect(getStudioStitchProviderLabel("dansugc")).toBe("DansUGC");
    expect(getStudioStitchProviderLabel("elevenlabs")).toBe("ElevenLabs");
    expect(getStudioStitchProviderLabel("gemini")).toBe("Gemini");
    expect(getStudioStitchProviderLabel("render")).toBe("Studio renderer");
  });
});
