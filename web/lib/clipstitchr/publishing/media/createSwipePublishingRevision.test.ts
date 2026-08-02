import { describe, expect, it } from "vitest";
import { createSwipePublishingRevision } from "@/lib/clipstitchr/publishing/media/createSwipePublishingRevision";
import { createSwipePublishingEditableStateDigest } from "@/lib/clipstitchr/publishing/media/createSwipePublishingEditableStateDigest";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import { createSha256HexDigest } from "@/lib/clipstitchr/crypto/createSha256HexDigest";
import { SWIPE_PUBLISHING_OUTPUT_CONTRACT } from "@/lib/clipstitchr/publishing/media/swipePublishingOutputContract";
import { SWIPE_PUBLISHING_RENDERER_VERSION } from "@/lib/clipstitchr/publishing/media/swipePublishingRendererVersion";

function createSlide(id: string, text: string): SwiprSlide {
  return {
    id,
    textOverlay: {
      endTime: 3,
      fontSize: 64,
      startTime: 0,
      styleId: "clean",
      text,
      width: 0.8,
      x: 0.5,
      y: 0.5,
    },
  };
}

describe("createSwipePublishingRevision", () => {
  it("creates a stable editable-state digest", async () => {
    const source = {
      backgroundId: "background_1",
      slides: [createSlide("slide_1", "One"), createSlide("slide_2", "Two")],
    };

    await expect(createSwipePublishingEditableStateDigest(source)).resolves.toBe(
      await createSwipePublishingEditableStateDigest(structuredClone(source)),
    );
  });

  it("changes the editable digest when slide state or order changes", async () => {
    const first = createSlide("slide_1", "One");
    const second = createSlide("slide_2", "Two");
    const baseline = await createSwipePublishingEditableStateDigest({
      backgroundId: "background_1",
      slides: [first, second],
    });

    await expect(
      createSwipePublishingEditableStateDigest({
        backgroundId: "background_2",
        slides: [first, second],
      }),
    ).resolves.not.toBe(baseline);
    await expect(
      createSwipePublishingEditableStateDigest({
        backgroundId: "background_1",
        slides: [second, first],
      }),
    ).resolves.not.toBe(baseline);
    await expect(
      createSwipePublishingEditableStateDigest({
        backgroundId: "background_1",
        slides: [createSlide("slide_1", "Changed"), second],
      }),
    ).resolves.not.toBe(baseline);
  });

  it("changes when an immutable background identity changes", async () => {
    const editableStateDigest = "b".repeat(64);
    const background = {
      contentType: "image/jpeg",
      id: "background_1",
      objectKey: "users/user_123/swipr-backgrounds/background_1/image.jpg",
      sizeBytes: 100,
      version: 'etag:"first"',
    };
    const baseline = await createSwipePublishingRevision({
      backgrounds: [background],
      editableStateDigest,
    });

    await expect(
      createSwipePublishingRevision({
        backgrounds: [{ ...background, version: 'etag:"mutated"' }],
        editableStateDigest,
      }),
    ).resolves.not.toBe(baseline);
  });

  it("changes when the explicit renderer contract version changes", async () => {
    const source = {
      backgrounds: [
        {
          contentType: "image/png",
          id: "background_1",
          objectKey: "users/user_123/swipr-backgrounds/background_1/image.png",
          sizeBytes: 100,
          version: 'etag:"first"',
        },
      ],
      editableStateDigest: "b".repeat(64),
    };

    await expect(
      createSwipePublishingRevision({
        ...source,
        rendererVersion: "renderer-v1",
      }),
    ).resolves.not.toBe(
      await createSwipePublishingRevision({
        ...source,
        rendererVersion: "renderer-v2",
      }),
    );
  });

  it("binds the provider-safe JPEG quality and renderer version into the revision", async () => {
    const background = {
      checksum: "sha256:background",
      contentType: "image/jpeg",
      id: "background_1",
      objectKey: "users/user_123/swipr-backgrounds/background_1/image.jpg",
      sizeBytes: 100,
    };
    const editableStateDigest = "b".repeat(64);
    const expected = await createSha256HexDigest(
      JSON.stringify({
        backgrounds: [
          {
            checksum: background.checksum,
            contentType: background.contentType,
            id: background.id,
            objectKey: background.objectKey,
            sizeBytes: background.sizeBytes,
            version: null,
          },
        ],
        editableStateDigest,
        output: {
          height: 1920,
          mimeType: SWIPE_PUBLISHING_OUTPUT_CONTRACT.mimeType,
          quality: SWIPE_PUBLISHING_OUTPUT_CONTRACT.quality,
          width: 1080,
        },
        rendererVersion: SWIPE_PUBLISHING_RENDERER_VERSION,
      }),
    );

    await expect(
      createSwipePublishingRevision({
        backgrounds: [background],
        editableStateDigest,
      }),
    ).resolves.toBe(expected);
  });
});
