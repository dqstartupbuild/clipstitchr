import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { PublishingAuthenticationError } from "@/lib/clipstitchr/publishing/identity/PublishingAuthenticationError";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { resolvePublishingApiMedia } from "@/lib/clipstitchr/publishing/api/resolvePublishingApiMedia";

const mocks = vi.hoisted(() => ({
  convex: Object.freeze({ kind: "authenticated-convex" }),
  createAuthenticatedConvexHttpClient: vi.fn(),
  createR2Client: vi.fn(),
  getAuthenticatedConvexToken: vi.fn(),
  getR2Environment: vi.fn(),
  headClient: Object.freeze({ kind: "r2-head-client" }),
  resolvePublishingMediaSourceForServer: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient:
      mocks.createAuthenticatedConvexHttpClient,
  }),
);
vi.mock(
  "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken",
  () => ({ getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken }),
);
vi.mock("@/lib/clipstitchr/server/r2/createR2Client", () => ({
  createR2Client: mocks.createR2Client,
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2Environment", () => ({
  getR2Environment: mocks.getR2Environment,
}));
vi.mock(
  "@/lib/clipstitchr/publishing/media/server/resolvePublishingMediaSourceForServer",
  () => ({
    resolvePublishingMediaSourceForServer:
      mocks.resolvePublishingMediaSourceForServer,
  }),
);

const descriptor = { kind: "swipe" as const, recordId: "swipe_123" };

describe("resolvePublishingApiMedia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.createAuthenticatedConvexHttpClient.mockReturnValue(mocks.convex);
    mocks.getR2Environment.mockReturnValue({ bucketName: "media-bucket" });
    mocks.createR2Client.mockReturnValue(mocks.headClient);
    mocks.resolvePublishingMediaSourceForServer.mockResolvedValue({
      kind: "swipe",
      mediaObjects: [
        {
          checksum:
            "sha256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
          contentType: "image/png",
          height: 1_920,
          objectKey: "users/user_123/swipes/swipe_123/slide-0.png",
          sizeBytes: 4_096,
          version: 'etag:"immutable-etag"',
          width: 1_080,
        },
      ],
      ownerId: "user_123",
      recordId: "swipe_123",
    });
  });

  it("uses the authenticated Convex client and R2 HEAD resolver", async () => {
    const result = await resolvePublishingApiMedia(descriptor);

    expect(mocks.createAuthenticatedConvexHttpClient).toHaveBeenCalledWith(
      "convex-token",
    );
    expect(mocks.resolvePublishingMediaSourceForServer).toHaveBeenCalledWith({
      bucketName: "media-bucket",
      convex: mocks.convex,
      descriptor,
      headClient: mocks.headClient,
    });
    expect(result.manifest).toMatchObject({
      objects: [
        {
          byteLength: 4_096,
          checksum: "0".repeat(64),
          objectKey: "users/user_123/swipes/swipe_123/slide-0.png",
          objectVersion: 'etag:"immutable-etag"',
          orderedIndex: 0,
        },
      ],
      sourceKind: "swipe",
      sourceRecordId: "swipe_123",
    });
    expect(result.manifest.contentChecksum).toMatch(/^[a-f0-9]{64}$/u);
    expect(result.manifest.sourceRevision).toMatch(/^[a-f0-9]{64}$/u);
    expect(result).not.toHaveProperty("ownerId");
    expect(JSON.stringify(result.manifest)).not.toContain("ownerId");
    expect(JSON.stringify(result.manifest)).not.toContain("https://");
  });

  it("requires a Convex token even after the outer Clerk guard", async () => {
    mocks.getAuthenticatedConvexToken.mockResolvedValueOnce(null);

    await expect(resolvePublishingApiMedia(descriptor)).rejects.toBeInstanceOf(
      PublishingAuthenticationError,
    );
    expect(mocks.resolvePublishingMediaSourceForServer).not.toHaveBeenCalled();
  });

  it("hides missing and cross-owner media behind a not-found boundary", async () => {
    mocks.resolvePublishingMediaSourceForServer.mockRejectedValueOnce(
      new PublishingMediaValidationError(
        "owner_mismatch",
        "private owner detail",
      ),
    );

    const result = resolvePublishingApiMedia(descriptor);
    await expect(result).rejects.toBeInstanceOf(PublishingProxyRequestError);
    await expect(result).rejects.toMatchObject({
      code: "publishing_media_not_found",
      status: 404,
    });
  });
});
