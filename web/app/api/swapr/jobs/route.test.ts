import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swapr/jobs/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };
  const replicate = {
    predictions: {
      create: vi.fn(),
    },
  };

  return {
    capturePostHogServerEvent: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => replicate),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getR2DownloadSignedUrl: vi.fn(),
    readSwaprJobCreateRequest: vi.fn(),
    replicate,
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    photoAssets: {
      get: "photoAssets.get",
    },
    rateLimits: {
      consumeR2Download: "rateLimits.consumeR2Download",
      consumeSwaprJobCreate: "rateLimits.consumeSwaprJobCreate",
    },
    replicateJobs: {
      recordSwaprJob: "replicateJobs.recordSwaprJob",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/analytics/capturePostHogServerEvent", () => ({
  capturePostHogServerEvent: mocks.capturePostHogServerEvent,
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient: mocks.createAuthenticatedConvexHttpClient,
  }),
);

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

vi.mock("@/lib/clipstitchr/server/readSwaprJobCreateRequest", () => ({
  readSwaprJobCreateRequest: mocks.readSwaprJobCreateRequest,
}));

function createRequest() {
  return new Request("https://clipstitchr.test/api/swapr/jobs", {
    body: "{}",
    method: "POST",
  });
}

function createBody(overrides: Record<string, unknown> = {}) {
  return {
    batchId: "batch_1",
    characterOrientation: "image",
    estimatedDurationSeconds: 8,
    generationSpeedTier: undefined,
    keepOriginalSound: true,
    mode: "pro",
    photoId: "photo_1",
    prompt: "walk toward camera",
    segmentIndex: 0,
    totalEstimatedDurationSeconds: 8,
    totalSegmentCount: 1,
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_123/swapr/reference.mp4",
      size: 100,
    },
    ...overrides,
  };
}

function createPhotoDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: "photo_1",
    photoObject: {
      contentType: "image/jpeg",
      key: "users/user_123/photos/photo_1.jpg",
      size: 50,
    },
    ...overrides,
  };
}

describe("POST /api/swapr/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.readSwaprJobCreateRequest.mockResolvedValue(createBody());
    mocks.convex.query.mockResolvedValue(createPhotoDocument());
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.getR2DownloadSignedUrl
      .mockResolvedValueOnce({ url: "https://r2.example/photo.jpg" })
      .mockResolvedValueOnce({ url: "https://r2.example/video.mp4" });
    mocks.replicate.predictions.create.mockResolvedValue({
      error: null,
      id: "prediction_1",
      logs: "",
      output: null,
      status: "processing",
      urls: {
        cancel: "https://replicate.example/cancel",
        get: "https://replicate.example/get",
        web: "https://replicate.example/web",
      },
    });
  });

  it("returns 401 before parsing when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.readSwaprJobCreateRequest).not.toHaveBeenCalled();
  });

  it("creates a Replicate Swapr prediction after quota and R2 checks", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        characterOrientation: "image",
        id: "prediction_1",
        mode: "pro",
        status: "processing",
      }),
    );
    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(api.photoAssets.get, {
      id: "photo_1",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSwaprJobCreate,
      {
        estimatedSeconds: 8,
        secret: "rate-limit-secret",
        shouldConsumeUserQuota: true,
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Download,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.replicate.predictions.create).toHaveBeenCalledWith({
      model: "kwaivgi/kling-v3-motion-control",
      input: {
        character_orientation: "image",
        image: "https://r2.example/photo.jpg",
        keep_original_sound: true,
        mode: "pro",
        prompt: "walk toward camera",
        video: "https://r2.example/video.mp4",
      },
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.replicateJobs.recordSwaprJob,
      expect.objectContaining({
        modelId: "kwaivgi/kling-v3-motion-control",
        predictionId: "prediction_1",
        secret: "rate-limit-secret",
        status: "processing",
      }),
    );
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user_123",
        event: "swapr_job_created",
      }),
    );
  });

  it("uses speed-tier overrides and per-segment quota for later segments", async () => {
    mocks.readSwaprJobCreateRequest.mockResolvedValueOnce(
      createBody({
        generationSpeedTier: "pro",
        mode: "pro",
        segmentIndex: 1,
        totalEstimatedDurationSeconds: 16,
        totalSegmentCount: 2,
      }),
    );

    await POST(createRequest());

    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSwaprJobCreate,
      expect.objectContaining({
        estimatedSeconds: 8,
        shouldConsumeUserQuota: false,
      }),
    );
    expect(mocks.replicate.predictions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          character_orientation: "image",
          mode: "std",
        }),
      }),
    );
  });

  it.each([
    ["Saved Swapr photo not found.", null],
    [
      "Swapr photo object must be an image.",
      createPhotoDocument({
        photoObject: {
          contentType: "video/mp4",
          key: "users/user_123/photos/photo_1.mp4",
          size: 50,
        },
      }),
    ],
    [
      "R2 object key is outside the authenticated user scope.",
      createPhotoDocument({
        photoObject: {
          contentType: "image/jpeg",
          key: "users/other_user/photos/photo_1.jpg",
          size: 50,
        },
      }),
    ],
  ])("returns 500 for invalid photo state: %s", async (message, photo) => {
    mocks.convex.query.mockResolvedValueOnce(photo);

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({ message });
    expect(response.status).toBe(500);
    expect(mocks.replicate.predictions.create).not.toHaveBeenCalled();
  });

  it.each([
    [
      "Swapr reference object must be a video.",
      { videoObject: { contentType: "image/jpeg" } },
    ],
    ["Choose a smaller source video for Swapr.", { videoObject: { size: 999999999 } }],
    ["Swapr reference segment is too long.", { estimatedDurationSeconds: 12 }],
    [
      "Swapr reference video is too long.",
      { totalEstimatedDurationSeconds: 999 },
    ],
    [
      "Swapr batch has too many segments.",
      { totalEstimatedDurationSeconds: 8, totalSegmentCount: 4 },
    ],
  ])("returns 500 for invalid video request: %s", async (message, override) => {
    const body = createBody();

    mocks.readSwaprJobCreateRequest.mockResolvedValueOnce({
      ...body,
      ...override,
      videoObject: {
        ...body.videoObject,
        ...((override as { videoObject?: object }).videoObject ?? {}),
      },
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({ message });
    expect(response.status).toBe(500);
    expect(mocks.replicate.predictions.create).not.toHaveBeenCalled();
  });

  it("returns 429 when the Swapr quota mutation is rate-limited", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "replicateSwaprVideoCreate",
        retryAfter: 1200,
      },
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "replicateSwaprVideoCreate",
        retryAfterSeconds: 2,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.replicate.predictions.create).not.toHaveBeenCalled();
  });
});
