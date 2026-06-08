import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCliprSceneAvatarImage } from "@/lib/clipstitchr/server/createCliprSceneAvatarImage";

const mocks = vi.hoisted(() => ({
  createAvatarPhotoGenerationInput: vi.fn(),
  createAvatarPhotoGenerationPrompt: vi.fn(),
  createCliprAvatarStillVariant: vi.fn(),
  fetchReplicateOutput: vi.fn(),
  getCliprAvatarStillModelId: vi.fn(),
  getGenerationSpeedTierProfile: vi.fn(),
  getRemoteImageFile: vi.fn(),
  getReplicateOutputUrls: vi.fn(),
  getReplicatePredictionModelReference: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/createAvatarPhotoGenerationInput", () => ({
  createAvatarPhotoGenerationInput: mocks.createAvatarPhotoGenerationInput,
}));

vi.mock("@/lib/clipstitchr/server/createAvatarPhotoGenerationPrompt", () => ({
  createAvatarPhotoGenerationPrompt: mocks.createAvatarPhotoGenerationPrompt,
}));

vi.mock("@/lib/clipstitchr/server/createCliprAvatarStillVariant", () => ({
  createCliprAvatarStillVariant: mocks.createCliprAvatarStillVariant,
}));

vi.mock("@/lib/clipstitchr/server/fetchReplicateOutput", () => ({
  fetchReplicateOutput: mocks.fetchReplicateOutput,
}));

vi.mock("@/lib/clipstitchr/server/getCliprAvatarStillModelId", () => ({
  getCliprAvatarStillModelId: mocks.getCliprAvatarStillModelId,
}));

vi.mock("@/lib/clipstitchr/server/getRemoteImageFile", () => ({
  getRemoteImageFile: mocks.getRemoteImageFile,
}));

vi.mock("@/lib/clipstitchr/server/getReplicateOutputUrls", () => ({
  getReplicateOutputUrls: mocks.getReplicateOutputUrls,
}));

vi.mock("@/lib/clipstitchr/server/getReplicatePredictionModelReference", () => ({
  getReplicatePredictionModelReference: mocks.getReplicatePredictionModelReference,
}));

vi.mock("@/lib/clipstitchr/utils/getGenerationSpeedTierProfile", () => ({
  getGenerationSpeedTierProfile: mocks.getGenerationSpeedTierProfile,
}));

function createReplicate(status = "succeeded", error?: unknown) {
  return {
    predictions: {
      create: vi.fn(async () => ({ id: "prediction_start" })),
    },
    wait: vi.fn(async () => ({
      error,
      id: "prediction_done",
      output: ["https://replicate.test/avatar.jpg"],
      status,
    })),
  };
}

describe("createCliprSceneAvatarImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createAvatarPhotoGenerationInput.mockReturnValue({
      input_images: ["reference"],
      prompt: "Generated prompt",
    });
    mocks.createAvatarPhotoGenerationPrompt.mockReturnValue("Generated prompt");
    mocks.createCliprAvatarStillVariant.mockReturnValue("wide product shot");
    mocks.fetchReplicateOutput.mockResolvedValue({
      arrayBuffer: vi.fn(async () => new Uint8Array([1, 2, 3]).buffer),
      headers: {
        get: vi.fn(() => "image/png"),
      },
    });
    mocks.getCliprAvatarStillModelId.mockReturnValue("avatar-still-model");
    mocks.getGenerationSpeedTierProfile.mockReturnValue({
      avatarImageQuality: "medium",
    });
    mocks.getRemoteImageFile.mockResolvedValue(
      new File(["avatar"], "clipr-avatar-reference.jpg", {
        type: "image/jpeg",
      }),
    );
    mocks.getReplicateOutputUrls.mockReturnValue([
      "https://replicate.test/avatar.jpg",
    ]);
    mocks.getReplicatePredictionModelReference.mockReturnValue({
      model: "avatar-still-model",
    });
  });

  it("creates a scene avatar image with the default description fallback", async () => {
    const replicate = createReplicate();

    await expect(
      createCliprSceneAvatarImage({
        avatarDescription: "  ",
        referenceImageUrl: "https://cdn.test/reference.jpg",
        replicate: replicate as never,
        scene: { visual: "Host points at the product." } as never,
        sceneControls: {
          location: "gym mirror",
          outfit: "black workout set",
          pose: "taking a progress photo",
        },
      }),
    ).resolves.toEqual({
      body: new Uint8Array([1, 2, 3]).buffer,
      contentType: "image/png",
      modelId: "avatar-still-model",
      outputUrl: "https://replicate.test/avatar.jpg",
      predictionId: "prediction_done",
    });

    expect(mocks.createAvatarPhotoGenerationPrompt).toHaveBeenCalledWith({
      avatarDescription:
        "Use the visible person in the reference image as the avatar.",
      identityMode: "same",
      modelId: "avatar-still-model",
      variant: "wide product shot",
    });
    expect(mocks.createCliprAvatarStillVariant).toHaveBeenCalledWith(
      { visual: "Host points at the product." },
      {
        location: "gym mirror",
        outfit: "black workout set",
        pose: "taking a progress photo",
      },
    );
    expect(mocks.getRemoteImageFile).toHaveBeenCalledWith(
      "https://cdn.test/reference.jpg",
      "clipr-avatar-reference.jpg",
    );
    expect(replicate.predictions.create).toHaveBeenCalledWith({
      model: "avatar-still-model",
      input: {
        input_images: ["reference"],
        prompt: "Generated prompt",
      },
    });
    expect(replicate.wait).toHaveBeenCalledWith(
      { id: "prediction_start" },
      { interval: 2000 },
    );
    expect(mocks.fetchReplicateOutput).toHaveBeenCalledWith(
      "https://replicate.test/avatar.jpg",
    );
  });

  it("uses a trimmed custom description and falls back to jpeg content type", async () => {
    mocks.fetchReplicateOutput.mockResolvedValueOnce({
      arrayBuffer: vi.fn(async () => new Uint8Array([4]).buffer),
      headers: {
        get: vi.fn(() => null),
      },
    });

    await expect(
      createCliprSceneAvatarImage({
        avatarDescription: "  Studio host  ",
        referenceImageUrl: "https://cdn.test/reference.jpg",
        replicate: createReplicate() as never,
        scene: { visual: "Close-up." } as never,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        contentType: "image/jpeg",
      }),
    );

    expect(mocks.createAvatarPhotoGenerationPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarDescription: "Studio host",
      }),
    );
  });

  it("throws when Replicate fails or omits an output URL", async () => {
    await expect(
      createCliprSceneAvatarImage({
        referenceImageUrl: "https://cdn.test/reference.jpg",
        replicate: createReplicate("failed", "Provider failed") as never,
        scene: { visual: "Close-up." } as never,
      }),
    ).rejects.toThrow("Provider failed");

    await expect(
      createCliprSceneAvatarImage({
        referenceImageUrl: "https://cdn.test/reference.jpg",
        replicate: createReplicate("canceled", { reason: "quota" }) as never,
        scene: { visual: "Close-up." } as never,
      }),
    ).rejects.toThrow(
      "Replicate did not complete Clipr avatar still generation.",
    );

    mocks.getReplicateOutputUrls.mockReturnValueOnce([]);

    await expect(
      createCliprSceneAvatarImage({
        referenceImageUrl: "https://cdn.test/reference.jpg",
        replicate: createReplicate() as never,
        scene: { visual: "Close-up." } as never,
      }),
    ).rejects.toThrow("Replicate did not return a Clipr avatar still.");
  });
});
