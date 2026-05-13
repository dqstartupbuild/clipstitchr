import { describe, expect, it } from "vitest";
import { createCliprMusicInput } from "@/lib/clipstitchr/server/createCliprMusicInput";

describe("createCliprMusicInput", () => {
  it("uses the stable audio defaults for Clipr music", () => {
    expect(
      createCliprMusicInput({
        prompt: "Cinematic Synthwave",
      }),
    ).toEqual({
      cfg_scale: 1,
      duration: 60,
      prompt: "Cinematic Synthwave",
      steps: 8,
    });
  });
});
