import { describe, expect, it } from "vitest";
import { assertStudioBetaR2ObjectKeyBelongsToUser } from "./assertStudioBetaR2ObjectKeyBelongsToUser";

describe("assertStudioBetaR2ObjectKeyBelongsToUser", () => {
  it("accepts only the versioned Studio owner prefix", () => {
    expect(() =>
      assertStudioBetaR2ObjectKeyBelongsToUser(
        "users/user_123/studio/v1/project/project_1/file.json",
        "user_123",
      ),
    ).not.toThrow();
  });

  it.each([
    "users/user_456/studio/v1/project/project_1/file.json",
    "users/user_123/video-clips/clip_1/video.mp4",
    "users/user_123/studio/v2/project/project_1/file.json",
    "users/user_123/studio/v1/../video-clips/clip_1/video.mp4",
    "users/user_123/studio/v1/media-output/file.mp4?X-Amz-Signature=secret",
    "users/user_123/studio/v1/media-output/file.mp4#fragment",
    "users/user_123/studio/v1/media-output\\file.mp4",
    "users/user_123/studio/v1/media-output/file.mp4\u0000",
  ])("rejects %s", (key) => {
    expect(() =>
      assertStudioBetaR2ObjectKeyBelongsToUser(key, "user_123"),
    ).toThrow("outside this account");
  });
});
