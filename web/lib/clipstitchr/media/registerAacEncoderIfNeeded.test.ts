import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canEncodeAudio: vi.fn(),
  registerAacEncoder: vi.fn(),
}));

vi.mock("@mediabunny/aac-encoder", () => ({
  registerAacEncoder: mocks.registerAacEncoder,
}));

vi.mock("mediabunny", () => ({
  canEncodeAudio: mocks.canEncodeAudio,
}));

async function importRegisterAacEncoderIfNeeded() {
  const importedModule = await import(
    "@/lib/clipstitchr/media/registerAacEncoderIfNeeded"
  );

  return importedModule.registerAacEncoderIfNeeded;
}

describe("registerAacEncoderIfNeeded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("does not register the AAC encoder when the browser can already encode AAC", async () => {
    mocks.canEncodeAudio.mockResolvedValue(true);
    const registerAacEncoderIfNeeded = await importRegisterAacEncoderIfNeeded();

    await registerAacEncoderIfNeeded();

    expect(mocks.canEncodeAudio).toHaveBeenCalledWith("aac");
    expect(mocks.registerAacEncoder).not.toHaveBeenCalled();
  });

  it("registers the AAC encoder when native AAC encoding is unavailable", async () => {
    mocks.canEncodeAudio.mockResolvedValue(false);
    const registerAacEncoderIfNeeded = await importRegisterAacEncoderIfNeeded();

    await registerAacEncoderIfNeeded();

    expect(mocks.registerAacEncoder).toHaveBeenCalledTimes(1);
  });

  it("reuses a single registration promise", async () => {
    mocks.canEncodeAudio.mockResolvedValue(false);
    const registerAacEncoderIfNeeded = await importRegisterAacEncoderIfNeeded();

    await Promise.all([
      registerAacEncoderIfNeeded(),
      registerAacEncoderIfNeeded(),
    ]);

    expect(mocks.canEncodeAudio).toHaveBeenCalledTimes(1);
    expect(mocks.registerAacEncoder).toHaveBeenCalledTimes(1);
  });
});
