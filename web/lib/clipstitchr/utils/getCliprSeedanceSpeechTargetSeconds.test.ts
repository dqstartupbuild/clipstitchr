import { describe, expect, it } from "vitest";
import { getCliprSeedanceSpeechTargetSeconds } from "@/lib/clipstitchr/utils/getCliprSeedanceSpeechTargetSeconds";

describe("getCliprSeedanceSpeechTargetSeconds", () => {
  it("leaves padding for Seedance-generated scene audio", () => {
    expect(getCliprSeedanceSpeechTargetSeconds(15)).toBe(13);
  });

  it("does not push short segments below the useful minimum", () => {
    expect(getCliprSeedanceSpeechTargetSeconds(8)).toBe(8);
  });
});
