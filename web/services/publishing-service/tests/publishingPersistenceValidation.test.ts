import { describe, expect, it } from "vitest";

import { PublishingPersistenceValidationError } from "../src/errors/PublishingPersistenceValidationError.js";
import { assertPublishingMediaObjects } from "../src/persistence/assertPublishingMediaObjects.js";
import { assertSafePersistenceJson } from "../src/persistence/assertSafePersistenceJson.js";
import { canonicalizeJsonValue } from "../src/persistence/canonicalizeJsonValue.js";
import { createCanonicalPublishingRequestHash } from "../src/persistence/createCanonicalPublishingRequestHash.js";

const CHECKSUM = "a".repeat(64);

describe("publishing persistence validation", () => {
  it("hashes canonical requests independently of object key order", () => {
    const first = createCanonicalPublishingRequestHash({
      caption: "A launch",
      destination: { provider: "instagram", id: "ig_1" },
    });
    const second = createCanonicalPublishingRequestHash({
      destination: { id: "ig_1", provider: "instagram" },
      caption: "A launch",
    });

    expect(first).toBe(second);
    expect(first).not.toBe(
      createCanonicalPublishingRequestHash({
        caption: "A different launch",
        destination: { provider: "instagram", id: "ig_1" },
      }),
    );
  });

  it("retains array order in canonical request hashes", () => {
    expect(canonicalizeJsonValue(["slide-1", "slide-2"])).not.toBe(
      canonicalizeJsonValue(["slide-2", "slide-1"]),
    );
  });

  it("accepts only ordered durable R2 object identities", () => {
    expect(
      assertPublishingMediaObjects([
        {
          orderedIndex: 0,
          objectKey: "publishing/tenant/revision/slide-0.webp",
          objectVersion: "version-1",
          checksum: CHECKSUM,
          byteLength: 1_024,
          contentType: "image/webp",
          width: 1080,
          height: 1350,
          hasAudio: false,
        },
      ]),
    ).toBe(1_024);

    for (const objectKey of [
      "blob:https://clipstitchr.example/local",
      "https://r2.example/object?X-Amz-Signature=secret",
      "../another-tenant/object.webp",
    ]) {
      expect(() =>
        assertPublishingMediaObjects([
          {
            orderedIndex: 0,
            objectKey,
            objectVersion: "version-1",
            checksum: CHECKSUM,
            byteLength: 1_024,
            contentType: "image/webp",
          },
        ]),
      ).toThrow(PublishingPersistenceValidationError);
    }
  });

  it("rejects secrets and fetch grants in durable JSON", () => {
    expect(() =>
      assertSafePersistenceJson(
        { accessToken: "must-never-persist" },
        "safeMetadata",
      ),
    ).toThrow(PublishingPersistenceValidationError);
    expect(() =>
      assertSafePersistenceJson(
        { mediaUrl: "https://r2.example/file?X-Amz-Signature=secret" },
        "safeMetadata",
      ),
    ).toThrow(PublishingPersistenceValidationError);
  });
});
