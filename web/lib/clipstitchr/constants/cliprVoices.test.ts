import { describe, expect, it } from "vitest";
import { cliprVoices } from "@/lib/clipstitchr/constants/cliprVoices";

describe("cliprVoices", () => {
  it("keeps the ElevenLabs voice IDs stable and unique", () => {
    const voiceIds = new Set<string>();

    for (const voice of cliprVoices) {
      expect(voice.id).toBe(voice.name);
      expect(voice.language).toBe("English (US)");
      expect(voice.description.length).toBeGreaterThan(0);
      expect(voice.prompt.length).toBeGreaterThan(0);
      expect(voiceIds.has(voice.id)).toBe(false);

      voiceIds.add(voice.id);
    }

    expect(voiceIds).toContain("Rachel");
    expect(voiceIds).toContain("Drew");
    expect(voiceIds.size).toBe(cliprVoices.length);
  });
});
