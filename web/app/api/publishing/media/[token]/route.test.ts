import {
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GET,
  HEAD,
} from "@/app/api/publishing/media/[token]/route";
import { sealPublishingMediaGatewayToken } from "@/lib/clipstitchr/publishing/media/gateway/sealPublishingMediaGatewayToken";

const mocks = vi.hoisted(() => ({
  consume: vi.fn(),
  send: vi.fn(),
}));

const nowEpochMs = Date.UTC(2026, 7, 2, 12, 0, 0);
const origin = "https://media.clipstitchr.test";
const tokenSecret = "token-secret-that-is-at-least-thirty-two-bytes-long";
const dependencies = {
  bucketName: "clipstitchr-media",
  nowEpochMs: () => nowEpochMs,
  publicOrigin: origin,
  r2Client: { send: mocks.send },
  rateLimiter: { consume: mocks.consume },
  tokenSecret,
};

vi.mock(
  "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaGatewayDependencies",
  () => ({ createPublishingMediaGatewayDependencies: () => dependencies }),
);

function createToken(expiresAtEpochMs = nowEpochMs + 900_000) {
  const issuedAtEpochMs = Math.min(nowEpochMs, expiresAtEpochMs - 1_000);

  return sealPublishingMediaGatewayToken(
    {
      audience: origin,
      checksum: "sha256:checksum",
      contentType: "video/mp4",
      etag: '"etag-1"',
      expiresAtEpochMs,
      grantKey: "pmg_aaaaaaaaaaaaaaaaaaaaaa",
      issuedAtEpochMs,
      objectKey: "users/user_123/video-clips/clip_123/video.mp4",
      provider: "tiktok",
      quotaIdentity:
        "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      schema: 1,
      sizeBytes: 8,
      versionId: "r2-version-1",
    },
    tokenSecret,
    () => Buffer.alloc(12, 6),
  );
}

function createBody(value: string) {
  return {
    transformToWebStream: () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(value));
          controller.close();
        },
      }),
  };
}

function createContext(token: string) {
  return { params: Promise.resolve({ token }) };
}

describe("GET and HEAD /api/publishing/media/[token]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consume.mockResolvedValue(undefined);
    mocks.send.mockImplementation(async (command) => {
      if (command instanceof HeadObjectCommand) {
        return {
          $metadata: {},
          ContentLength: 8,
          ContentType: "video/mp4",
          ETag: '"etag-1"',
          VersionId: "r2-version-1",
        };
      }

      return {
        $metadata: {},
        Body: createBody("abcdefgh"),
        ContentLength: 8,
        ContentType: "video/mp4",
        ETag: '"etag-1"',
        VersionId: "r2-version-1",
      };
    });
  });

  it("streams a complete GET directly with the exact R2 identity and no redirect", async () => {
    const token = createToken();
    const response = await GET(
      new Request(`${origin}/api/publishing/media/${token}`),
      createContext(token),
    );

    await expect(response.text()).resolves.toBe("abcdefgh");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-length")).toBe("8");
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-disposition")).toBe("inline");
    expect(response.headers.get("cross-origin-resource-policy")).toBe(
      "cross-origin",
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("location")).toBeNull();
    expect(mocks.consume).toHaveBeenCalledWith({
      grantKey: "pmg_aaaaaaaaaaaaaaaaaaaaaa",
      quotaIdentity:
        "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      readBytes: 8,
    });
    const command = mocks.send.mock.calls[0][0];
    expect(command).toBeInstanceOf(GetObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: "clipstitchr-media",
      IfMatch: '"etag-1"',
      Key: "users/user_123/video-clips/clip_123/video.mp4",
      VersionId: "r2-version-1",
    });
  });

  it("serves HEAD without reading or returning object bytes", async () => {
    const token = createToken();
    const response = await HEAD(
      new Request(`${origin}/api/publishing/media/${token}`, {
        method: "HEAD",
      }),
      createContext(token),
    );

    await expect(response.text()).resolves.toBe("");
    expect(response.status).toBe(200);
    expect(mocks.consume).toHaveBeenCalledWith(
      expect.objectContaining({ readBytes: 0 }),
    );
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(HeadObjectCommand);
  });

  it("serves one satisfiable byte range as 206", async () => {
    mocks.send.mockResolvedValueOnce({
      $metadata: {},
      Body: createBody("cdef"),
      ContentLength: 4,
      ContentRange: "bytes 2-5/8",
      ContentType: "video/mp4",
      ETag: '"etag-1"',
      VersionId: "r2-version-1",
    });
    const token = createToken();
    const response = await GET(
      new Request(`${origin}/api/publishing/media/${token}`, {
        headers: { Range: "bytes=2-5" },
      }),
      createContext(token),
    );

    await expect(response.text()).resolves.toBe("cdef");
    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 2-5/8");
    expect(response.headers.get("content-length")).toBe("4");
    expect(mocks.consume).toHaveBeenCalledWith(
      expect.objectContaining({ readBytes: 4 }),
    );
    expect(mocks.send.mock.calls[0][0].input.Range).toBe("bytes=2-5");
  });

  it.each(["bytes=20-30", "bytes=0-1,4-5", "items=0-1"])(
    "returns 416 without reading R2 for invalid range %s",
    async (range) => {
      const token = createToken();
      const response = await GET(
        new Request(`${origin}/api/publishing/media/${token}`, {
          headers: { Range: range },
        }),
        createContext(token),
      );

      expect(response.status).toBe(416);
      expect(response.headers.get("content-range")).toBe("bytes */8");
      expect(mocks.consume).toHaveBeenCalledWith(
        expect.objectContaining({ readBytes: 0 }),
      );
      expect(mocks.send).not.toHaveBeenCalled();
    },
  );

  it("returns 429 with retry timing before an R2 read", async () => {
    mocks.consume.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "publishingMediaReadBytesByGrant",
        retryAfter: 1_500,
      },
    });
    const token = createToken();
    const response = await GET(
      new Request(`${origin}/api/publishing/media/${token}`),
      createContext(token),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("2");
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("rejects foreign origins and expired grants before quota or R2", async () => {
    const token = createToken(nowEpochMs);
    const foreignResponse = await GET(
      new Request(`https://foreign.test/api/publishing/media/${token}`),
      createContext(token),
    );
    const expiredResponse = await GET(
      new Request(`${origin}/api/publishing/media/${token}`),
      createContext(token),
    );

    expect(foreignResponse.status).toBe(404);
    expect(expiredResponse.status).toBe(410);
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("returns 410 instead of streaming an object with a changed ETag", async () => {
    mocks.send.mockResolvedValueOnce({
      $metadata: {},
      Body: createBody("abcdefgh"),
      ContentLength: 8,
      ContentType: "video/mp4",
      ETag: '"etag-2"',
      VersionId: "r2-version-1",
    });
    const token = createToken();
    const response = await GET(
      new Request(`${origin}/api/publishing/media/${token}`),
      createContext(token),
    );

    expect(response.status).toBe(410);
    expect(response.headers.get("location")).toBeNull();
  });

  it("enforces GET and HEAD as the only token methods", async () => {
    const token = createToken();
    const response = await GET(
      new Request(`${origin}/api/publishing/media/${token}`, {
        method: "POST",
      }),
      createContext(token),
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
