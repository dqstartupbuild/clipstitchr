import { describe, expect, it, vi } from "vitest";

import { derivePersonalTenantKey } from "../src/identity/derivePersonalTenantKey.js";
import { ProviderRuntimeError } from "../src/provider-runtime/errors/ProviderRuntimeError.js";
import { YouTubeProviderAdapter } from "../src/provider-runtime/youtube/YouTubeProviderAdapter.js";
import type { YouTubeUploadTransport } from "../src/provider-runtime/youtube/YouTubeUploadTransport.js";
import type { PublishingProviderWorkflowContext } from "../src/workflow/PublishingProviderWorkflowContext.js";
import type { PublishingWorkflowPort } from "../src/workflow/PublishingWorkflowPort.js";
import type { PublishingWorkflowWorkItem } from "../src/workflow/PublishingWorkflowWorkItem.js";
import type { StoredPublishingWorkflowCheckpoint } from "../src/workflow/StoredPublishingWorkflowCheckpoint.js";
import { advanceYouTubePublishingWorkflow } from "../src/workflow/advanceYouTubePublishingWorkflow.js";
import { FakeProviderHttpClient } from "./support/FakeProviderHttpClient.js";

const NOW = new Date("2026-08-12T18:00:00.000Z");
const SESSION =
  "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=session_1";
const TOTAL_BYTES = 9 * 1_024 * 1_024;

const createItem = (
  checkpoint: unknown,
  checkpointVersion = 0,
): PublishingWorkflowWorkItem => ({
  tenantKey: derivePersonalTenantKey("user_youtube_workflow"),
  ownerId: "user_youtube_workflow",
  productId: "product_1",
  postStateId: "state_1",
  attemptId: "attempt_1",
  attemptKey: "attempt_1",
  checkpointVersion,
  checkpoint,
  providerCallAllowed: true,
  alreadyPublished: false,
  terminal: false,
  provider: "youtube",
  integrationId: "integration_1",
  accountId: "channel_1",
  grantedScopes: ["https://www.googleapis.com/auth/youtube.upload"],
  caption: "Fallback description",
  settings: {
    provider: "youtube",
    title: "A useful video",
    visibility: "unlisted",
    madeForKids: false,
    tags: ["studio"],
  },
  media: [
    {
      orderedIndex: 0,
      objectKey: "studio/clips/output.mp4",
      version: "etag:output-v1",
      checksum: "a".repeat(64),
      byteLength: TOTAL_BYTES,
      contentType: "video/mp4",
      durationSeconds: 30,
    },
  ],
  createdAtEpochMilliseconds: NOW.getTime(),
});

const createHarness = (
  item: PublishingWorkflowWorkItem,
  upload: YouTubeUploadTransport,
) => {
  const checkpoints: unknown[] = [];
  const observations: unknown[] = [];
  const port: PublishingWorkflowPort = {
    load: vi.fn(),
    readAccessToken: vi.fn().mockResolvedValue("access-secret"),
    resolveMediaGrants: vi.fn().mockResolvedValue([
      {
        url: "https://media.example/api/studio/publishing/media/token",
        expiresAtEpochMilliseconds: NOW.getTime() + 60_000,
      },
    ]),
    writeCheckpoint: vi.fn(async (input) => {
      checkpoints.push(input.checkpoint);
      return input.expectedVersion + 1;
    }),
    recordObservation: vi.fn(async (input) => {
      observations.push(input.observation);
    }),
  };
  const runtime = new YouTubeProviderAdapter({
    clientId: "google-client",
    clientSecret: "google-client-secret",
    http: new FakeProviderHttpClient([]),
    upload,
  });
  const context: PublishingProviderWorkflowContext = {
    item,
    port,
    now: () => NOW,
  };
  return { checkpoints, context, observations, port, runtime };
};

const createUpload = (
  overrides: Partial<YouTubeUploadTransport> = {},
): YouTubeUploadTransport => ({
  initiate: vi.fn().mockResolvedValue(SESSION),
  probe: vi.fn().mockResolvedValue({ kind: "active", committedOffset: 0 }),
  uploadRange: vi.fn().mockResolvedValue({
    kind: "active",
    committedOffset: 8 * 1_024 * 1_024,
  }),
  uploadThumbnail: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("advanceYouTubePublishingWorkflow", () => {
  it("writes intent before creating a bounded resumable session", async () => {
    const upload = createUpload();
    const harness = createHarness(createItem({}), upload);
    await expect(
      advanceYouTubePublishingWorkflow(harness.context, harness.runtime, null),
    ).resolves.toMatchObject({ kind: "retry", safeErrorCode: "provider_processing" });
    expect(harness.checkpoints).toEqual([
      expect.objectContaining({ stage: "youtube-session-intent" }),
      expect.objectContaining({
        stage: "youtube-upload",
        sessionUri: SESSION,
        committedOffset: 0,
        totalBytes: TOTAL_BYTES,
      }),
    ]);
    expect(upload.initiate).toHaveBeenCalledWith(
      expect.objectContaining({
        totalBytes: TOTAL_BYTES,
        metadata: expect.objectContaining({
          description: "Fallback description",
          visibility: "unlisted",
        }),
      }),
    );
  });

  it("probes, uploads one 8 MiB range, and records an observable receipt", async () => {
    const upload = createUpload({
      uploadRange: vi.fn().mockResolvedValue({
        kind: "complete",
        videoId: "video_1",
      }),
    });
    const stored: StoredPublishingWorkflowCheckpoint = {
      schemaVersion: 1,
      stage: "youtube-upload",
      sessionUri: SESSION,
      totalBytes: TOTAL_BYTES,
      committedOffset: 0,
      videoId: null,
      thumbnailState: "not-requested",
    };
    const harness = createHarness(createItem(stored, 3), upload);
    await expect(
      advanceYouTubePublishingWorkflow(harness.context, harness.runtime, stored),
    ).resolves.toEqual({ kind: "complete" });
    expect(upload.probe).toHaveBeenCalledBefore(
      upload.uploadRange as ReturnType<typeof vi.fn>,
    );
    expect(upload.uploadRange).toHaveBeenCalledWith(
      expect.objectContaining({
        startOffset: 0,
        endOffsetInclusive: 8 * 1_024 * 1_024 - 1,
      }),
    );
    expect(harness.observations).toEqual([
      expect.objectContaining({
        result: expect.objectContaining({
          kind: "published",
          remotePostIds: ["video_1"],
          remoteUrls: ["https://www.youtube.com/watch?v=video_1"],
        }),
      }),
    ]);
  });

  it("reconciles a lost chunk response by retrying from the durable checkpoint", async () => {
    const upload = createUpload({
      uploadRange: vi.fn().mockRejectedValue(
        new ProviderRuntimeError("youtube", "network", true),
      ),
    });
    const stored: StoredPublishingWorkflowCheckpoint = {
      schemaVersion: 1,
      stage: "youtube-upload",
      sessionUri: SESSION,
      totalBytes: TOTAL_BYTES,
      committedOffset: 0,
      videoId: null,
      thumbnailState: "not-requested",
    };
    const harness = createHarness(createItem(stored, 3), upload);
    await expect(
      advanceYouTubePublishingWorkflow(harness.context, harness.runtime, stored),
    ).resolves.toMatchObject({
      kind: "retry",
      safeErrorCode: "provider_status_unavailable",
    });
    expect(harness.checkpoints).toEqual([]);
    expect(harness.observations).toEqual([]);
  });

  it("marks a recovered session-intent checkpoint outcome unknown", async () => {
    const upload = createUpload();
    const stored: StoredPublishingWorkflowCheckpoint = {
      schemaVersion: 1,
      stage: "youtube-session-intent",
      operationId: "operation_1",
      totalBytes: TOTAL_BYTES,
    };
    const harness = createHarness(createItem(stored, 1), upload);
    await expect(
      advanceYouTubePublishingWorkflow(harness.context, harness.runtime, stored),
    ).resolves.toEqual({ kind: "complete" });
    expect(upload.initiate).not.toHaveBeenCalled();
    expect(harness.observations).toEqual([
      expect.objectContaining({
        result: expect.objectContaining({ kind: "outcome_unknown" }),
      }),
    ]);
  });
});
