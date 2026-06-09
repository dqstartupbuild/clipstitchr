import { describe, expect, it } from "vitest";
import { createCliprElevenLabsSpeechInput } from "@/lib/clipstitchr/server/createCliprElevenLabsSpeechInput";

describe("createCliprElevenLabsSpeechInput", () => {
  it("creates ElevenLabs v3 speech input from the selected voice", () => {
    expect(
      createCliprElevenLabsSpeechInput({
        script: "This workflow saves a lot of editing time.",
        voiceId: "Rachel",
      }),
    ).toEqual(
      expect.objectContaining({
        language_code: "en",
        prompt: "This workflow saves a lot of editing time.",
        voice: "Rachel",
      }),
    );
  });
});
