import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCliprGeneration } from "@/lib/clipstitchr/hooks/useCliprGeneration";

const mocks = vi.hoisted(() => ({
  createCliprJob: vi.fn(),
  createId: vi.fn(),
  useStateSetter: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.useStateSetter,
  ],
}));

vi.mock("@/lib/clipstitchr/client/createCliprJob", () => ({
  createCliprJob: mocks.createCliprJob,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createCliprJob(overrides: Record<string, unknown> = {}) {
  return {
    avatarId: "avatar_1",
    avatarPhotoId: "photo_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "job_1",
    productId: "product_1",
    productName: "Product",
    progress: 0.08,
    scenePlan: [],
    stage: "hook-script",
    status: "scripting",
    targetDurationSeconds: 30,
    updatedAt: "2026-05-20T00:00:00.000Z",
    voiceId: "Zephyr (Female)",
    ...overrides,
  };
}

function createGenerateOptions() {
  return {
    addMusic: true,
    avatarId: "avatar_1",
    durationSeconds: 30,
    musicTrackId: "track_1",
    productId: "product_1",
    scriptIdea: "Talk about the launch mistake nobody notices.",
    voiceId: "Zephyr (Female)",
  } as unknown as Parameters<
    ReturnType<typeof useCliprGeneration>["generate"]
  >[0];
}

describe("useCliprGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createId.mockReturnValue("job_1");
    mocks.createCliprJob.mockResolvedValue(createCliprJob());
  });

  it("queues a Clipr provider job and returns the job id", async () => {
    const onCreated = vi.fn();
    const state = useCliprGeneration({ onCreated });

    await expect(state.generate(createGenerateOptions())).resolves.toBe("job_1");

    expect(mocks.createCliprJob).toHaveBeenCalledWith({
      ...createGenerateOptions(),
      jobId: "job_1",
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Clip queued for background processing",
    );
    expect(mocks.useStateSetter).toHaveBeenCalledWith("queued");
  });

  it("returns null and reports queueing failures", async () => {
    mocks.createCliprJob.mockRejectedValueOnce(new Error("provider queue down"));
    const state = useCliprGeneration({});

    await expect(state.generate(createGenerateOptions())).resolves.toBeNull();

    expect(mocks.useStateSetter).toHaveBeenCalledWith("error");
    expect(mocks.useStateSetter).toHaveBeenCalledWith("provider queue down");
  });
});
