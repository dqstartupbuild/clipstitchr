import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { readPublishingApiCreatePostRequest } from "../src/publishing-api/readPublishingApiCreatePostRequest.js";
import { readPublishingApiProductQuery } from "../src/publishing-api/readPublishingApiProductQuery.js";
import { readPublishingApiYouTubeSettings } from "../src/publishing-api/readPublishingApiYouTubeSettings.js";

const digest = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");

const createManifest = (
  sourceKind: "studio-clip-output" | "studio-stitch-output",
  contentType: "video/mp4" | "image/jpeg" = "video/mp4",
) => {
  const object: Record<string, string | number | boolean> = {
    byteLength: contentType === "video/mp4" ? 8_388_609 : 512_000,
    checksum: "a".repeat(64),
    contentType,
    objectKey: `studio/${sourceKind}/asset.${contentType === "video/mp4" ? "mp4" : "jpg"}`,
    objectVersion: "etag:asset-v1",
    orderedIndex: 0,
    ...(contentType === "video/mp4"
      ? {
          audioCodec: "aac",
          durationSeconds: 30,
          hasAudio: true,
          height: 1920,
          videoCodec: "h264",
          width: 1080,
        }
      : { height: 720, width: 1280 }),
  };
  const objects = [object];
  const contentChecksum = digest(
    objects.map(({ byteLength, checksum, orderedIndex }) => ({
      byteLength,
      checksum,
      orderedIndex,
    })),
  );
  const sourceRecordId = `${sourceKind}-record`;
  const normalizedObject = contentType === "video/mp4"
    ? {
        audioCodec: object["audioCodec"],
        byteLength: object["byteLength"],
        checksum: object["checksum"],
        contentType: object["contentType"],
        durationSeconds: object["durationSeconds"],
        hasAudio: object["hasAudio"],
        height: object["height"],
        objectKey: object["objectKey"],
        objectVersion: object["objectVersion"],
        orderedIndex: object["orderedIndex"],
        videoCodec: object["videoCodec"],
        width: object["width"],
      }
    : {
        byteLength: object["byteLength"],
        checksum: object["checksum"],
        contentType: object["contentType"],
        height: object["height"],
        objectKey: object["objectKey"],
        objectVersion: object["objectVersion"],
        orderedIndex: object["orderedIndex"],
        width: object["width"],
      };
  const sourceRevision = digest({
    contentChecksum,
    objects: [normalizedObject],
    sourceKind,
    sourceRecordId,
  });
  return {
    contentChecksum,
    objects,
    sourceKind,
    sourceRecordId,
    sourceRevision,
  };
};

describe("YouTube publishing API request", () => {
  it("accepts a Product-bound Studio output with strict YouTube settings", () => {
    const media = createManifest("studio-clip-output");
    const thumbnail = createManifest("studio-stitch-output", "image/jpeg");
    const parsed = readPublishingApiCreatePostRequest({
      caption: "The full description",
      destinations: [
        {
          integrationId: "youtube_connection",
          provider: "youtube",
          settings: {
            title: "A useful title",
            description: "A bounded description",
            visibility: "unlisted",
            madeForKids: false,
            tags: ["short form", "studio"],
            thumbnail,
          },
        },
      ],
      idempotencyKey: "publish_request_1",
      intent: "publish-now",
      media: {
        kind: "studio-clip-output",
        recordId: media.sourceRecordId,
      },
      mediaRevision: media.sourceRevision,
      productId: "product_1",
      resolvedMedia: media,
    });

    expect(parsed).toMatchObject({
      productId: "product_1",
      media: { kind: "studio-clip-output" },
      destinations: [
        {
          provider: "youtube",
          settings: {
            title: "A useful title",
            visibility: "unlisted",
            madeForKids: false,
          },
        },
      ],
    });
  });

  it("implements the official combined 500-character tag rule", () => {
    const validWhitespaceTag = `${"a".repeat(496)} b`;
    expect(
      readPublishingApiYouTubeSettings({
        title: "Valid title",
        visibility: "private",
        madeForKids: true,
        tags: [validWhitespaceTag],
      }).tags,
    ).toEqual([validWhitespaceTag]);
    expect(() =>
      readPublishingApiYouTubeSettings({
        title: "Valid title",
        visibility: "private",
        madeForKids: true,
        tags: [`${"a".repeat(497)} b`],
      }),
    ).toThrow();
  });

  it("requires exactly one nonempty Product query value", () => {
    expect(readPublishingApiProductQuery(new URLSearchParams("productId=product_1")))
      .toBe("product_1");
    for (const query of ["", "productId=", "productId=a&productId=b", "productId=a&x=b"]) {
      expect(() => readPublishingApiProductQuery(new URLSearchParams(query))).toThrow();
    }
  });
});
