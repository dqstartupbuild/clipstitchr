import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCliprAvatarVideo } from "@/lib/clipstitchr/server/createCliprAvatarVideo";
import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { createProductEnrichment } from "@/lib/clipstitchr/server/createProductEnrichment";
import { createReplicateImageDataUrl } from "@/lib/clipstitchr/server/createReplicateImageDataUrl";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getRemoteImageFile } from "@/lib/clipstitchr/server/getRemoteImageFile";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicateOutputUrls } from "@/lib/clipstitchr/server/getReplicateOutputUrls";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { getSafeReplicateOutputUrl } from "@/lib/clipstitchr/server/getSafeReplicateOutputUrl";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import { saveCliprMusicObject } from "@/lib/clipstitchr/server/saveCliprMusicObject";
import { saveCliprSceneImageObject } from "@/lib/clipstitchr/server/saveCliprSceneImageObject";
import { saveLibraryMusicObject } from "@/lib/clipstitchr/server/saveLibraryMusicObject";
import { saveSharedMusicObject } from "@/lib/clipstitchr/server/saveSharedMusicObject";
import { saveStitchMusicObject } from "@/lib/clipstitchr/server/saveStitchMusicObject";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  getCompletedReplicatePredictionOutputText: vi.fn(),
  parseCliprTextGenerationOutput: vi.fn(),
  putR2Object: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText",
  () => ({
    getCompletedReplicatePredictionOutputText:
      mocks.getCompletedReplicatePredictionOutputText,
  }),
);

vi.mock("@/lib/clipstitchr/server/parseCliprTextGenerationOutput", () => ({
  parseCliprTextGenerationOutput: mocks.parseCliprTextGenerationOutput,
}));

vi.mock("@/lib/clipstitchr/server/r2/putR2Object", () => ({
  putR2Object: mocks.putR2Object,
}));

type ReplicateClient = Parameters<typeof createProductEnrichment>[0]["replicate"];

function createReplicate() {
  let predictionCount = 0;
  const predictionCreate = vi.fn(async (request: unknown) => {
    predictionCount += 1;

    return {
      id: `prediction_${predictionCount}`,
      request,
    };
  });
  const wait = vi.fn(async (prediction: { id: string }) => ({
    id: prediction.id,
    output: "https://replicate.delivery/output.mp4",
    status: "succeeded",
  }));

  return {
    predictionCreate,
    replicate: {
      predictions: {
        create: predictionCreate,
      },
      wait,
    } as unknown as ReplicateClient,
    wait,
  };
}

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch workflow kit",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("server utility coverage", () => {
  const originalReplicateApiToken = process.env.REPLICATE_API_TOKEN;
  const originalReplicateKey = process.env.REPLICATE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.REPLICATE_API_TOKEN;
    delete process.env.REPLICATE_KEY;
    mocks.putR2Object.mockImplementation(
      async ({
        body,
        contentType,
        key,
      }: {
        body: ArrayBuffer;
        contentType: string;
        key: string;
      }) => ({
        contentType,
        key,
        size: body.byteLength,
      }),
    );
    mocks.getCompletedReplicatePredictionOutputText.mockResolvedValue(
      JSON.stringify({
        inferredPainPoints: ["slow launches"],
        inferredProblem: "Campaigns take too long",
      }),
    );
    mocks.parseCliprTextGenerationOutput.mockReturnValue({
      hooks: ["Hook"],
      providerModel: "model",
    });
  });

  afterEach(() => {
    if (originalReplicateApiToken === undefined) {
      delete process.env.REPLICATE_API_TOKEN;
    } else {
      process.env.REPLICATE_API_TOKEN = originalReplicateApiToken;
    }

    if (originalReplicateKey === undefined) {
      delete process.env.REPLICATE_KEY;
    } else {
      process.env.REPLICATE_KEY = originalReplicateKey;
    }

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("validates and reads Replicate output URL shapes", () => {
    expect(
      getSafeReplicateOutputUrl("https://api.replicate.com/v1/files/file_1")
        .hostname,
    ).toBe("api.replicate.com");
    expect(
      getSafeReplicateOutputUrl("https://foo.replicate.delivery/out.png")
        .hostname,
    ).toBe("foo.replicate.delivery");
    expect(() => getSafeReplicateOutputUrl(null)).toThrow(
      "Missing output URL.",
    );
    expect(() => getSafeReplicateOutputUrl("http://replicate.delivery/out")).toThrow(
      "Swapr output URLs must use HTTPS.",
    );
    expect(() =>
      getSafeReplicateOutputUrl("https://example.com/out"),
    ).toThrow("Unsupported Swapr output host.");
    expect(getReplicateOutputUrl([{ url: 1 }, { url: "https://out.test" }])).toBe(
      "https://out.test",
    );
    expect(() => getReplicateOutputUrl({ url: 1 })).toThrow(
      "Replicate completed but did not return an output URL.",
    );
    expect(
      getReplicateOutputUrls([
        "https://one.test",
        [{ url: "https://two.test" }, { url: 1 }],
      ]),
    ).toEqual(["https://one.test", "https://two.test"]);
    expect(getReplicatePredictionStatus("processing")).toBe("processing");
    expect(() => getReplicatePredictionStatus("queued")).toThrow(
      "Unsupported Replicate prediction status.",
    );
  });

  it("fetches Replicate output with API authorization only for API-hosted files", async () => {
    const fetchMock = vi.fn(async (...args: Parameters<typeof fetch>) => {
      void args;
      return new Response("ok");
    });

    process.env.REPLICATE_API_TOKEN = "replicate-token";
    vi.stubGlobal("fetch", fetchMock);

    await fetchReplicateOutput("https://api.replicate.com/v1/files/file_1");

    expect(
      (
        fetchMock.mock.calls[0]![1] as unknown as { headers: Headers }
      ).headers.get("Authorization"),
    ).toBe("Bearer replicate-token");

    await fetchReplicateOutput("https://replicate.delivery/out.png");

    expect(
      (
        fetchMock.mock.calls[1]![1] as unknown as { headers: Headers }
      ).headers.get("Authorization"),
    ).toBeNull();

    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));

    await expect(
      fetchReplicateOutput("https://replicate.delivery/bad.png"),
    ).rejects.toThrow("Unable to fetch Replicate output.");
  });

  it("creates Replicate image data URLs and remote image files", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("img", {
          headers: {
            "content-type": "image/png",
          },
        }),
      ),
    );

    await expect(
      createReplicateImageDataUrl("https://replicate.delivery/image.png"),
    ).resolves.toEqual({
      dataUrl: "data:image/png;base64,aW1n",
      mimeType: "image/png",
    });
    await expect(
      getRemoteImageFile("https://example.com/reference.jpg", "fallback.jpg"),
    ).resolves.toEqual(expect.objectContaining({
      name: "fallback.jpg",
      type: "image/png",
    }));

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("missing", { status: 404 })),
    );

    await expect(
      getRemoteImageFile("https://example.com/missing.jpg", "fallback.jpg"),
    ).rejects.toThrow("Unable to load the avatar reference image.");
  });

  it("calls Replicate wrappers for product and Clipr text generation", async () => {
    const { predictionCreate, replicate } = createReplicate();
    const product = createProduct();

    await expect(
      createProductEnrichment({
        product: {
          audienceDetails: product.audienceDetails,
          name: product.name,
          productDetails: product.productDetails,
        },
        replicate,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        inferredPainPoints: ["slow launches"],
        inferredProblem: "Campaigns take too long",
      }),
    );
    expect(predictionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          max_completion_tokens: 12000,
          prompt: expect.stringContaining("Launch Kit"),
        }),
      }),
    );

    await expect(
      createCliprTextGeneration({
        durationSeconds: 30,
        product,
        purpose: "clipr",
        replicate,
        slideCount: 3,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        hooks: ["Hook"],
        providerModel: "model",
      }),
    );
    expect(mocks.parseCliprTextGenerationOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        durationSeconds: 30,
        outputText: expect.any(String),
        product,
        purpose: "clipr",
        slideCount: 3,
      }),
    );
  });

  it("creates Clipr avatar video output and surfaces failed predictions", async () => {
    const { predictionCreate, replicate, wait } = createReplicate();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("video", {
          headers: {
            "content-type": "video/webm",
          },
        }),
      ),
    );

    await expect(
      createCliprAvatarVideo({
        imageUrl: "https://example.com/avatar.jpg",
        replicate,
        script: "Try this workflow.",
        voiceId: "Puck (Male)",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        contentType: "video/webm",
        predictionId: "prediction_1",
      }),
    );
    expect(predictionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          image: "https://example.com/avatar.jpg",
          voice: "Puck (Male)",
        }),
      }),
    );

    wait.mockResolvedValueOnce({
      error: "provider failed",
      id: "prediction_failed",
      status: "failed",
    } as unknown as Awaited<ReturnType<typeof wait>>);

    await expect(
      createCliprAvatarVideo({
        imageUrl: "https://example.com/avatar.jpg",
        replicate,
        script: "Try this workflow.",
        voiceId: "Puck (Male)",
      }),
    ).rejects.toThrow("provider failed");
  });

  it("saves generated media objects under the expected R2 keys", async () => {
    const body = new Uint8Array([1, 2, 3]).buffer;

    await expect(
      saveCliprAvatarVideoObject({
        body,
        contentType: "video/mp4",
        jobId: "job_1",
        userId: "user_1",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        key: "users/user_1/clipr-scenes/job_1/avatar.mp4",
      }),
    );
    await saveCliprMusicObject({
      body,
      contentType: "audio/mpeg",
      jobId: "job_1",
      userId: "user_1",
    });
    await saveCliprSceneImageObject({
      body,
      contentType: "image/png",
      jobId: "job_1",
      sceneId: "scene/1",
      userId: "user_1",
    });
    await saveLibraryMusicObject({
      body,
      contentType: "audio/mpeg",
      trackId: "track_1",
      userId: "user_1",
    });
    await saveSharedMusicObject({
      body,
      contentType: "audio/mpeg",
      trackId: "track_1",
    });
    await saveStitchMusicObject({
      body,
      contentType: "audio/mpeg",
      stitchId: "stitch_1",
      userId: "user_1",
    });

    expect(mocks.putR2Object).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "users/user_1/clipr-music/job_1/music.mp3",
      }),
    );
    expect(mocks.putR2Object).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "users/user_1/clipr-scenes/job_1-scene-1/image.png",
      }),
    );
    expect(mocks.putR2Object).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "users/user_1/library-music/track_1/music.mp3",
      }),
    );
    expect(mocks.putR2Object).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "shared/music/track_1/audio.mp3",
      }),
    );
    expect(mocks.putR2Object).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "users/user_1/stitch-music/stitch_1/music.mp3",
      }),
    );
  });
});
