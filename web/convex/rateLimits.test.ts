import { beforeEach, describe, expect, it, vi } from "vitest";
import * as rateLimits from "./rateLimits";

type ConvexFunction<Args> = {
  handler: (ctx: unknown, args: Args) => Promise<void>;
};

type LimitCall = {
  count?: number;
  key?: string;
  name: string;
  throws: true;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
}));

vi.mock("./auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

function getHandler<Args>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args>).handler;
}

function createCtx(job: Record<string, unknown> | null = null) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const queryChain = {
    unique: vi.fn(async () => job),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => unknown) => {
        callback(indexQuery);

        return queryChain;
      },
    ),
  };
  const ctx = {
    db: {
      query: vi.fn(() => queryChain),
    },
  };

  return { ctx, indexQuery, queryChain };
}

function limitCalls() {
  return mocks.rateLimiter.limit.mock.calls.map((call) => {
    const [, name, options] = call as [
      unknown,
      string,
      Omit<LimitCall, "name">,
    ];

    return {
      name,
      ...options,
    };
  });
}

describe("convex rateLimits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it.each([
    {
      args: { secret: "secret", sizeBytes: 10.2 },
      expected: [
        {
          count: 1,
          key: "owner_123",
          name: "r2UploadUrl",
          throws: true,
        },
        { count: 1, name: "r2UploadUrlGlobal", throws: true },
        {
          count: 11,
          key: "owner_123",
          name: "r2UploadBytes",
          throws: true,
        },
        { count: 11, name: "r2UploadBytesGlobal", throws: true },
        {
          count: 11,
          key: "owner_123",
          name: "r2UploadBytesMonthly",
          throws: true,
        },
        { count: 11, name: "r2UploadBytesMonthlyGlobal", throws: true },
      ],
      mutation: rateLimits.consumeR2Upload,
    },
    {
      args: { secret: "secret" },
      expected: [
        { key: "owner_123", name: "swipePublishingPrepare", throws: true },
        { name: "swipePublishingPrepareGlobal", throws: true },
      ],
      mutation: rateLimits.consumeSwipePublishingPrepare,
    },
    {
      args: { secret: "secret" },
      expected: [
        { key: "owner_123", name: "r2DownloadUrl", throws: true },
      ],
      mutation: rateLimits.consumeR2Download,
    },
    {
      args: {
        grantKey: "pmg_aaaaaaaaaaaaaaaaaaaaaa",
        quotaIdentity:
          "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        readBytes: 4_096,
        secret: "secret",
      },
      expected: [
        {
          key: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:pmg_aaaaaaaaaaaaaaaaaaaaaa",
          name: "publishingMediaReadRequestsByGrant",
          throws: true,
        },
        {
          key: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          name: "publishingMediaReadRequestsByQuota",
          throws: true,
        },
        { name: "publishingMediaReadRequestsGlobal", throws: true },
        {
          count: 4_096,
          key: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:pmg_aaaaaaaaaaaaaaaaaaaaaa",
          name: "publishingMediaReadBytesByGrant",
          throws: true,
        },
        {
          count: 4_096,
          key: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          name: "publishingMediaReadBytesByQuota",
          throws: true,
        },
        {
          count: 4_096,
          name: "publishingMediaReadBytesGlobal",
          throws: true,
        },
      ],
      mutation: rateLimits.consumePublishingMediaRead,
    },
    {
      args: { objectCount: 3.1, secret: "secret" },
      expected: [
        {
          count: 4,
          key: "owner_123",
          name: "r2DeleteObjects",
          throws: true,
        },
      ],
      mutation: rateLimits.consumeR2Delete,
    },
    {
      args: { key: "client_123", secret: "secret" },
      expected: [
        {
          key: "client_123",
          name: "tiktokEventsApiByClient",
          throws: true,
        },
        { name: "tiktokEventsApiGlobal", throws: true },
      ],
      mutation: rateLimits.consumeTikTokEventsApi,
    },
    {
      args: { key: "client_123", secret: "secret", urlCount: 2.1 },
      expected: [
        {
          count: 3,
          key: "client_123",
          name: "indexNowSubmitUrlsByClient",
          throws: true,
        },
        { count: 3, name: "indexNowSubmitUrlsGlobal", throws: true },
      ],
      mutation: rateLimits.consumeIndexNowSubmit,
    },
    {
      args: { secret: "secret" },
      expected: [
        { key: "owner_123", name: "pexelsSearch", throws: true },
        { name: "pexelsSearchGlobal", throws: true },
      ],
      mutation: rateLimits.consumePexelsSearch,
    },
    {
      args: { count: 12.1, secret: "secret" },
      expected: [
        {
          count: 13,
          key: "owner_123",
          name: "pexelsImportImages",
          throws: true,
        },
        { count: 13, name: "pexelsImportImagesGlobal", throws: true },
      ],
      mutation: rateLimits.consumePexelsImport,
    },
    {
      args: { secret: "secret" },
      expected: [
        { key: "owner_123", name: "postBridgeSchedule", throws: true },
        { key: "owner_123", name: "postBridgeScheduleHourly", throws: true },
        { key: "owner_123", name: "postBridgeScheduleDaily", throws: true },
        { name: "postBridgeScheduleGlobalDaily", throws: true },
      ],
      mutation: rateLimits.consumePostBridgeSchedule,
    },
    {
      args: { mediaSizeBytes: 1024.2, secret: "secret" },
      expected: [
        {
          count: 1025,
          key: "owner_123",
          name: "postBridgeUploadBytesDaily",
          throws: true,
        },
        {
          count: 1025,
          name: "postBridgeUploadBytesGlobalDaily",
          throws: true,
        },
      ],
      mutation: rateLimits.consumePostBridgeMediaUpload,
    },
    {
      args: { secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "replicateUploadAnalysis",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateUploadAnalysisMonthly",
          throws: true,
        },
        { name: "replicateUploadAnalysisGlobal", throws: true },
      ],
      mutation: rateLimits.consumeUploadAnalysis,
    },
    {
      args: { secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "replicateUploadVideoAnalysis",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateUploadVideoAnalysisMonthly",
          throws: true,
        },
        { name: "replicateUploadVideoAnalysisGlobal", throws: true },
      ],
      mutation: rateLimits.consumeUploadVideoAnalysis,
    },
    {
      args: { secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "replicateUploadAnalysis",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateUploadAnalysisMonthly",
          throws: true,
        },
        { name: "replicateUploadAnalysisGlobal", throws: true },
      ],
      mutation: rateLimits.consumeSwiprBackgroundAnalyze,
    },
    {
      args: { secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "replicateSwaprPhotoExpand",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateSwaprPhotoExpandDaily",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateSwaprPhotoExpandMonthly",
          throws: true,
        },
        { name: "replicateSwaprPhotoExpandGlobal", throws: true },
      ],
      mutation: rateLimits.consumeSwaprPhotoExpand,
    },
    {
      args: { estimatedSeconds: 12.2, secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "replicateSwaprJobCreate",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateSwaprJobCreateDaily",
          throws: true,
        },
        {
          count: 13,
          key: "owner_123",
          name: "replicateSwaprGeneratedSecondsMonthly",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateSwaprProviderSegment",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateSwaprProviderSegmentDaily",
          throws: true,
        },
        { name: "replicateSwaprJobCreateGlobal", throws: true },
      ],
      mutation: rateLimits.consumeSwaprJobCreate,
    },
    {
      args: { estimatedSeconds: 7.2, secret: "secret" },
      expected: [
        { key: "owner_123", name: "cliprJobCreate", throws: true },
        { key: "owner_123", name: "cliprJobCreateDaily", throws: true },
        {
          count: 8,
          key: "owner_123",
          name: "cliprGeneratedSecondsMonthly",
          throws: true,
        },
        { name: "cliprProviderSpendGlobal", throws: true },
      ],
      mutation: rateLimits.consumeCliprJobCreate,
    },
    {
      args: { secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "cliprHookScriptGenerate",
          throws: true,
        },
        { name: "cliprProviderSpendGlobal", throws: true },
      ],
      mutation: rateLimits.consumeCliprHookScript,
    },
    {
      args: { count: 3.2, secret: "secret" },
      expected: [
        {
          count: 4,
          key: "owner_123",
          name: "cliprHookScriptGenerate",
          throws: true,
        },
        { count: 4, name: "cliprProviderSpendGlobal", throws: true },
      ],
      mutation: rateLimits.consumeCliprHookScript,
    },
    {
      args: { estimatedSeconds: 5.2, secret: "secret" },
      expected: [
        {
          count: 6,
          key: "owner_123",
          name: "cliprVoiceGenerate",
          throws: true,
        },
        {
          count: 6,
          name: "cliprProviderSpendGlobal",
          throws: true,
        },
      ],
      mutation: rateLimits.consumeCliprVoiceGeneration,
    },
    {
      args: { secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "cliprAvatarStillGenerate",
          throws: true,
        },
        { name: "cliprProviderSpendGlobal", throws: true },
      ],
      mutation: rateLimits.consumeCliprAvatarStillGeneration,
    },
    {
      args: { generatedSeconds: 9.2, secret: "secret" },
      expected: [
        {
          count: 10,
          key: "owner_123",
          name: "cliprMusicGenerate",
          throws: true,
        },
        {
          count: 10,
          key: "owner_123",
          name: "cliprMusicGenerateDaily",
          throws: true,
        },
        {
          count: 10,
          name: "cliprProviderSpendGlobal",
          throws: true,
        },
      ],
      mutation: rateLimits.consumeCliprMusicGeneration,
    },
    {
      args: { generatedSeconds: 9.2, secret: "secret" },
      expected: [
        {
          count: 10,
          key: "owner_123",
          name: "stitchMusicGenerate",
          throws: true,
        },
        {
          count: 10,
          key: "owner_123",
          name: "stitchMusicGenerateDaily",
          throws: true,
        },
        {
          count: 10,
          name: "cliprProviderSpendGlobal",
          throws: true,
        },
      ],
      mutation: rateLimits.consumeStitchMusicGeneration,
    },
    {
      args: { generatedSeconds: 9.2, secret: "secret" },
      expected: [
        {
          count: 10,
          key: "owner_123",
          name: "sharedMusicGenerate",
          throws: true,
        },
        {
          count: 10,
          key: "owner_123",
          name: "sharedMusicGenerateDaily",
          throws: true,
        },
        {
          count: 10,
          name: "cliprProviderSpendGlobal",
          throws: true,
        },
      ],
      mutation: rateLimits.consumeSharedMusicGeneration,
    },
    {
      args: { secret: "secret" },
      expected: [{ key: "owner_123", name: "cliprJobPoll", throws: true }],
      mutation: rateLimits.consumeCliprJobPoll,
    },
    {
      args: { count: 4.1, secret: "secret" },
      expected: [
        {
          count: 5,
          key: "owner_123",
          name: "replicateAvatarPhotoGenerate",
          throws: true,
        },
        {
          count: 5,
          key: "owner_123",
          name: "replicateAvatarPhotoGenerateDaily",
          throws: true,
        },
        {
          count: 5,
          key: "owner_123",
          name: "replicateAvatarPhotoGenerateMonthly",
          throws: true,
        },
        {
          count: 5,
          name: "replicateAvatarPhotoGenerateGlobal",
          throws: true,
        },
      ],
      mutation: rateLimits.consumeAvatarPhotoGenerate,
    },
    {
      args: { secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "replicateSwiprBackgroundGenerate",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateSwiprBackgroundGenerateDaily",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateSwiprBackgroundGenerateMonthly",
          throws: true,
        },
        { name: "replicateSwiprBackgroundGenerateGlobal", throws: true },
      ],
      mutation: rateLimits.consumeSwiprBackgroundGenerate,
    },
    {
      args: { count: 6.1, secret: "secret" },
      expected: [
        {
          count: 7,
          key: "owner_123",
          name: "replicateSwiprSeedBackgroundGenerateDev",
          throws: true,
        },
        {
          count: 7,
          name: "replicateSwiprSeedBackgroundGenerateDevGlobal",
          throws: true,
        },
      ],
      mutation: rateLimits.consumeSwiprSeedBackgroundGenerateDev,
    },
    {
      args: { secret: "secret" },
      expected: [
        {
          key: "owner_123",
          name: "replicateProductEnrichment",
          throws: true,
        },
        {
          key: "owner_123",
          name: "replicateProductEnrichmentMonthly",
          throws: true,
        },
        { name: "replicateProductEnrichmentGlobal", throws: true },
      ],
      mutation: rateLimits.consumeProductEnrichment,
    },
    {
      args: { secret: "secret" },
      expected: [
        { key: "owner_123", name: "avatarCascadeDelete", throws: true },
      ],
      mutation: rateLimits.consumeAvatarCascadeDelete,
    },
  ] satisfies Array<{
    args: Record<string, unknown>;
    expected: LimitCall[];
    mutation: unknown;
  }>)("consumes the expected limit buckets", async ({ args, expected, mutation }) => {
    const { ctx } = createCtx();

    await getHandler<Record<string, unknown>>(mutation)(ctx, args);

    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith("secret");
    expect(limitCalls()).toEqual(expected);
  });

  it("can skip user quota for Swapr job creation while preserving provider limits", async () => {
    const { ctx } = createCtx();

    await getHandler<Record<string, unknown>>(rateLimits.consumeSwaprJobCreate)(
      ctx,
      {
        estimatedSeconds: 12.2,
        secret: "secret",
        shouldConsumeUserQuota: false,
      },
    );

    expect(limitCalls()).toEqual([
      {
        key: "owner_123",
        name: "replicateSwaprProviderSegment",
        throws: true,
      },
      {
        key: "owner_123",
        name: "replicateSwaprProviderSegmentDaily",
        throws: true,
      },
      { name: "replicateSwaprJobCreateGlobal", throws: true },
    ]);
  });

  it("requires positive finite counts before consuming limit buckets", async () => {
    const { ctx } = createCtx();

    await expect(
      getHandler<Record<string, unknown>>(rateLimits.consumeR2Delete)(ctx, {
        objectCount: 0,
        secret: "secret",
      }),
    ).rejects.toThrow("Object count must be a positive number.");
    await expect(
      getHandler<Record<string, unknown>>(
        rateLimits.consumeCliprVoiceGeneration,
      )(ctx, {
        estimatedSeconds: Number.POSITIVE_INFINITY,
        secret: "secret",
      }),
    ).rejects.toThrow("Estimated voice seconds must be a positive number.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
  });

  it("checks Swapr job ownership before polling or canceling", async () => {
    const { ctx, indexQuery, queryChain } = createCtx({
      outputUrl: "https://example.com/output.mp4",
      purpose: "swapr-video",
    });

    await getHandler<Record<string, unknown>>(rateLimits.consumeSwaprJobPoll)(
      ctx,
      {
        predictionId: "prediction_123",
        secret: "secret",
      },
    );
    await getHandler<Record<string, unknown>>(rateLimits.consumeSwaprJobCancel)(
      ctx,
      {
        predictionId: "prediction_123",
        secret: "secret",
      },
    );
    await getHandler<Record<string, unknown>>(
      rateLimits.consumeSwaprOutputDownload,
    )(ctx, {
      outputUrl: "https://example.com/output.mp4",
      predictionId: "prediction_123",
      secret: "secret",
    });

    expect(ctx.db.query).toHaveBeenCalledWith("replicateJobs");
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_owner_prediction",
      expect.any(Function),
    );
    expect(indexQuery.eq).toHaveBeenCalledWith("ownerId", "owner_123");
    expect(indexQuery.eq).toHaveBeenCalledWith(
      "predictionId",
      "prediction_123",
    );
    expect(limitCalls()).toEqual([
      {
        key: "owner_123",
        name: "replicateSwaprJobPoll",
        throws: true,
      },
      {
        key: "owner_123",
        name: "replicateSwaprJobCancel",
        throws: true,
      },
      {
        key: "owner_123",
        name: "replicateSwaprOutputDownload",
        throws: true,
      },
    ]);
  });

  it("rejects missing or mismatched Swapr output jobs before consuming limits", async () => {
    const missingJob = createCtx(null);
    const mismatchedOutput = createCtx({
      outputUrl: "https://example.com/other.mp4",
      purpose: "swapr-video",
    });
    const wrongPurpose = createCtx({
      outputUrl: "https://example.com/output.mp4",
      purpose: "clipr-video",
    });

    await expect(
      getHandler<Record<string, unknown>>(rateLimits.consumeSwaprJobPoll)(
        missingJob.ctx,
        {
          predictionId: "prediction_123",
          secret: "secret",
        },
      ),
    ).rejects.toThrow("Swapr job not found.");
    await expect(
      getHandler<Record<string, unknown>>(
        rateLimits.consumeSwaprOutputDownload,
      )(mismatchedOutput.ctx, {
        outputUrl: "https://example.com/output.mp4",
        predictionId: "prediction_123",
        secret: "secret",
      }),
    ).rejects.toThrow("Swapr output not found.");
    await expect(
      getHandler<Record<string, unknown>>(rateLimits.consumeSwaprJobCancel)(
        wrongPurpose.ctx,
        {
          predictionId: "prediction_123",
          secret: "secret",
        },
      ),
    ).rejects.toThrow("Swapr job not found.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
  });
});
