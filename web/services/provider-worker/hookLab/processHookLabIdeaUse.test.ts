import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createImage: vi.fn(),
  createReplicateClient: vi.fn(() => ({})),
  createTextOverlay: vi.fn(() => ({ text: "Fresh hook" })),
  createUseGeneration: vi.fn(),
  createVideo: vi.fn(),
  getDownloadUrl: vi.fn(),
  getVideoModelId: vi.fn(() => "kwaivgi/kling-v2.1"),
  parseJob: vi.fn(() => ({ variantId: "variant-1" })),
  reserveHook: vi.fn(),
  saveImage: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/createCliprSceneAvatarImage", () => ({
  createCliprSceneAvatarImage: mocks.createImage,
}));
vi.mock("@/lib/clipstitchr/server/createCliprVisualAvatarVideoOutput", () => ({
  createCliprVisualAvatarVideoOutput: mocks.createVideo,
}));
vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getDownloadUrl,
}));
vi.mock("@/lib/clipstitchr/server/saveCliprSceneImageObject", () => ({
  saveCliprSceneImageObject: mocks.saveImage,
}));
vi.mock("./createHookLabTextOverlay", () => ({
  createHookLabTextOverlay: mocks.createTextOverlay,
}));
vi.mock("./createHookLabUseGeneration", () => ({
  createHookLabUseGeneration: mocks.createUseGeneration,
}));
vi.mock("./getHookLabVisualVideoModelId", () => ({
  getHookLabVisualVideoModelId: mocks.getVideoModelId,
}));
vi.mock("./parseHookLabIdeaUseJobInput", () => ({
  parseHookLabIdeaUseJobInput: mocks.parseJob,
}));
vi.mock("./reserveHookLabVariantHook", () => ({
  reserveHookLabVariantHook: mocks.reserveHook,
}));

import { processHookLabIdeaUse } from "./processHookLabIdeaUse";

const imageObject = {
  contentType: "image/png",
  key: "users/owner-1/clipr-scenes/variant-1/image.png",
  size: 100,
};
const videoObject = {
  contentType: "video/mp4",
  key: "users/owner-1/clipr-scenes/variant-1/avatar.mp4",
  size: 200,
};
const writing = {
  generatedCaption: "A caption",
  generatedHook: "Fresh hook",
  modelId: "text-model",
  predictionIds: ["writing-prediction"],
  rewriteCount: 0,
  textDecision: "adapted" as const,
  textDecisionReason: "Fits this product.",
  visualPrompt: "A fresh reaction in a bright kitchen.",
  visualPromptSummary: "A fresh reaction",
};

function createInput() {
  return {
    avatar: { id: "avatar-1", name: "Alex" },
    avatarPhoto: {
      photoObject: {
        contentType: "image/jpeg",
        key: "users/owner-1/photos/avatar.jpg",
        size: 50,
      },
    },
    demoClip: {
      duration: 5,
      hasAudio: true,
      id: "demo-1",
      name: "Demo",
      videoObject: {
        contentType: "video/mp4",
        key: "users/owner-1/video-clips/demo/video.mp4",
        size: 300,
      },
    },
    idea: {
      creativeBeat: {
        beats: [{ description: "React" }],
        emotionalTurn: "Surprise",
        genericObjects: [],
        mustNotCopy: [],
        openingVisualState: "Neutral",
        payoff: "Recognition",
      },
      id: "idea-1",
      name: "Morning idea",
      textBlueprint: {
        cadence: "Short",
        claimsRequiringSupport: [],
        emotionalJob: "Curiosity",
        exactReuseConstraints: [],
        productSpecificTokens: [],
        reusablePattern: "A {{change}}",
        semanticSlots: [],
        sourceText: "Source hook",
        unresolvedVisualReferences: [],
      },
    },
    product: {
      audienceDetails: "Busy parents",
      id: "product-1",
      name: "Daily Brew",
      productDetails: "A coffee concentrate",
    },
    siblingHooks: [],
    use: { id: "use-1" },
    variant: {
      id: "variant-1",
      providerPredictionIds: [],
      variantIndex: 0,
    },
  };
}

function createClient(input: ReturnType<typeof createInput>) {
  return {
    mutation: vi.fn().mockResolvedValue(null),
    query: vi.fn().mockResolvedValue(input),
  };
}

describe("processHookLabIdeaUse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createUseGeneration.mockResolvedValue(writing);
    mocks.reserveHook.mockResolvedValue({
      accepted: true,
      id: "variant-1",
      siblingHooks: [],
    });
    mocks.getDownloadUrl.mockResolvedValue({ url: "https://r2.example/input" });
    mocks.createImage.mockResolvedValue({
      body: new ArrayBuffer(4),
      contentType: "image/png",
      predictionId: "image-prediction",
    });
    mocks.saveImage.mockResolvedValue(imageObject);
    mocks.createVideo.mockResolvedValue({
      avatarVideoObject: videoObject,
      avatarVideoProviderPredictionId: "video-prediction",
    });
  });

  it("checkpoints each generated object before media finalization", async () => {
    const input = createInput();
    const client = createClient(input);

    await processHookLabIdeaUse({
      client: client as never,
      job: {
        id: "provider-1",
        inputSnapshotJson: "{}",
        ownerId: "owner-1",
      },
      providerWorkerSecret: "secret",
    });

    expect(mocks.reserveHook).toHaveBeenCalledWith(
      expect.objectContaining({ visualPrompt: writing.visualPrompt }),
    );
    const mutationInputs = client.mutation.mock.calls.map(([, args]) => args);
    expect(mutationInputs).toContainEqual(
      expect.objectContaining({ imageObject, predictionId: "image-prediction" }),
    );
    expect(mutationInputs).toContainEqual(
      expect.objectContaining({ videoObject, predictionId: "video-prediction" }),
    );
    const mediaInput = mutationInputs.find(
      (args) => typeof args?.inputSnapshotJson === "string",
    );
    const snapshot = JSON.parse(mediaInput?.inputSnapshotJson ?? "{}");
    expect(snapshot.temporaryObjects).toEqual([imageObject, videoObject]);
  });

  it("resumes from durable writing and object checkpoints without new paid generation", async () => {
    const input = createInput();
    Object.assign(input.variant, {
      generatedCaption: writing.generatedCaption,
      generatedHook: writing.generatedHook,
      generatedImageObject: imageObject,
      generatedVideoObject: videoObject,
      providerPredictionIds: [
        "writing-prediction",
        "image-prediction",
        "video-prediction",
      ],
      textDecision: writing.textDecision,
      textDecisionReason: writing.textDecisionReason,
      visualPrompt: writing.visualPrompt,
      visualPromptSummary: writing.visualPromptSummary,
    });
    const client = createClient(input);

    await processHookLabIdeaUse({
      client: client as never,
      job: {
        id: "provider-1",
        inputSnapshotJson: "{}",
        ownerId: "owner-1",
      },
      providerWorkerSecret: "secret",
    });

    expect(mocks.createUseGeneration).not.toHaveBeenCalled();
    expect(mocks.reserveHook).not.toHaveBeenCalled();
    expect(mocks.createImage).not.toHaveBeenCalled();
    expect(mocks.saveImage).not.toHaveBeenCalled();
    expect(mocks.createVideo).not.toHaveBeenCalled();
    expect(mocks.getDownloadUrl).not.toHaveBeenCalled();
  });
});
