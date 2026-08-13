import { describe, expect, it } from "vitest";
import { assertStudioEditorUploadObjectKey } from "./assertStudioEditorUploadObjectKey";

describe("assertStudioEditorUploadObjectKey", () => {
  it("accepts the exact owner and Product Studio media-source namespace", () => {
    expect(() =>
      assertStudioEditorUploadObjectKey(
        "users/owner_1/studio/v1/media-source/product_1/upload_1/video.mp4",
        "owner_1",
        "product_1",
      ),
    ).not.toThrow();
  });

  it.each([
    "users/owner_2/studio/v1/media-source/product_1/upload_1/video.mp4",
    "users/owner_1/studio/v1/media-source/product_2/upload_1/video.mp4",
    "users/owner_1/studio/v1/media-source/product_1/../private/video.mp4",
    "users/owner_1/studio/v1/media-source/product_1/%2e%2e/private.mp4",
    "users/owner_1/studio/v1/media-source/product_1/upload_1\\video.mp4",
    "users/owner_1/studio/v1/media-source/product_1/upload_1/video.mp4?token=x",
    "users/owner_1/studio/v1/media-source/product_1/upload_1/video.mp4#fragment",
    "users/owner_1/studio/v1/media-source/product_1/upload_1/\u0000video.mp4",
  ])("rejects a poisoned object key: %s", (objectKey) => {
    expect(() =>
      assertStudioEditorUploadObjectKey(objectKey, "owner_1", "product_1"),
    ).toThrow("outside this Product or account");
  });
});
