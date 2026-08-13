import { describe, expect, it } from "vitest";
import { assertStudioClipsOutputObjectKey } from "./assertStudioClipsOutputObjectKey";

describe("assertStudioClipsOutputObjectKey", () => {
  it("accepts only the exact owner, Product, and worker-work namespace", () => {
    expect(() =>
      assertStudioClipsOutputObjectKey({
        objectKey:
          "users/user_1/studio/v1/studio-clips/product_1/task_1/clip_1/clip.mp4",
        ownerId: "user_1",
        productId: "product_1",
        workId: "task_1",
      }),
    ).not.toThrow();

    for (const objectKey of [
      "users/user_1/studio/v1/studio-clips/product_2/task_1/clip_1/clip.mp4",
      "users/user_1/studio/v1/studio-clips/product_1/task_2/clip_1/clip.mp4",
      "users/user_2/studio/v1/studio-clips/product_1/task_1/clip_1/clip.mp4",
      "users/user_1/studio/v1/studio-clips/product_1/task_1/../private.mp4",
    ]) {
      expect(() =>
        assertStudioClipsOutputObjectKey({
          objectKey,
          ownerId: "user_1",
          productId: "product_1",
          workId: "task_1",
        }),
      ).toThrow("another Product");
    }
  });
});
