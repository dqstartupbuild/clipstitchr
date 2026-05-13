import { describe, expect, it } from "vitest";
import { getCliprMusicGain } from "@/lib/clipstitchr/media/getCliprMusicGain";

describe("getCliprMusicGain", () => {
  it("keeps music below source audio by default", () => {
    expect(getCliprMusicGain({ hasSourceAudio: true, volume: 1 })).toBe(0.18);
  });

  it("uses a louder standalone music bed when the source has no audio", () => {
    expect(getCliprMusicGain({ hasSourceAudio: false, volume: 1 })).toBe(0.35);
  });

  it("clamps the user volume", () => {
    expect(getCliprMusicGain({ hasSourceAudio: true, volume: 2 })).toBe(0.18);
    expect(getCliprMusicGain({ hasSourceAudio: true, volume: -1 })).toBe(0);
  });
});
