import { beforeEach, describe, expect, it, vi } from "vitest";
import { readLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/readLocalVideoInspection";

const mocks = vi.hoisted(() => ({
  createMediaInput: vi.fn(),
  dispose: vi.fn(),
  getLocalVideoInspection: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/media/createMediaInput", () => ({
  createMediaInput: mocks.createMediaInput,
}));

vi.mock(
  "@/lib/clipstitchr/tools/localVideoInspection/getLocalVideoInspection",
  () => ({
    getLocalVideoInspection: mocks.getLocalVideoInspection,
  }),
);

describe("readLocalVideoInspection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createMediaInput.mockReturnValue({ dispose: mocks.dispose });
  });

  it("disposes its Media Bunny input after success and error", async () => {
    const file = new File(["video"], "demo.mp4");
    mocks.getLocalVideoInspection.mockResolvedValueOnce({ fileName: "demo.mp4" });

    await expect(readLocalVideoInspection(file)).resolves.toEqual({
      fileName: "demo.mp4",
    });
    expect(mocks.dispose).toHaveBeenCalledTimes(1);

    mocks.getLocalVideoInspection.mockRejectedValueOnce(new Error("Unreadable"));
    await expect(readLocalVideoInspection(file)).rejects.toThrow("Unreadable");
    expect(mocks.dispose).toHaveBeenCalledTimes(2);
  });

  it("disposes immediately and rejects an already canceled read", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      readLocalVideoInspection(new File(["video"], "demo.mp4"), controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(mocks.getLocalVideoInspection).not.toHaveBeenCalled();
    expect(mocks.dispose).toHaveBeenCalledTimes(1);
  });

  it("disposes stale in-flight work when a selection is canceled", async () => {
    let finishInspection: ((value: { fileName: string }) => void) | undefined;
    mocks.getLocalVideoInspection.mockReturnValue(
      new Promise((resolve) => {
        finishInspection = resolve;
      }),
    );
    const controller = new AbortController();
    const promise = readLocalVideoInspection(
      new File(["video"], "old.mp4"),
      controller.signal,
    );

    controller.abort();
    finishInspection?.({ fileName: "old.mp4" });

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
    expect(mocks.dispose).toHaveBeenCalledTimes(1);
  });
});
