import { afterEach, describe, expect, it, vi } from "vitest";
import { getCliprLipSyncModelId } from "@/lib/clipstitchr/server/getCliprLipSyncModelId";
import { getCliprTtsModelId } from "@/lib/clipstitchr/server/getCliprTtsModelId";

describe("Clipr model id resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses safe defaults when env values are absent or invalid", () => {
    vi.stubEnv("CLIPR_TTS_MODEL_ID", "unknown");
    vi.stubEnv("CLIPR_LIP_SYNC_MODEL_ID", "unknown");

    expect(getCliprTtsModelId()).toBe("elevenlabs/v3");
    expect(getCliprLipSyncModelId()).toBe("pixverse/lipsync");
  });

  it("allows validated request overrides", () => {
    expect(getCliprTtsModelId("none")).toBe("none");
    expect(getCliprLipSyncModelId("none")).toBe("none");
    expect(
      getCliprLipSyncModelId(
        "bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293",
      ),
    ).toBe(
      "bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293",
    );
  });
});
