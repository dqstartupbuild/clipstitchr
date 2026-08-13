import { describe, expect, it } from "vitest";
import { getStudioClipsPublicErrorMessage } from "./getStudioClipsPublicErrorMessage";

describe("getStudioClipsPublicErrorMessage", () => {
  it("keeps ordinary bounded validation guidance", () => {
    expect(
      getStudioClipsPublicErrorMessage(
        new Error("The trim range is invalid."),
        "Unable to update the output.",
      ),
    ).toBe("The trim range is invalid.");
  });

  it("redacts credentials, signed URLs, and authorization values", () => {
    for (const message of [
      "Bearer abcdef",
      "https://r2.test/file?X-Amz-Signature=hidden",
      "authorization=hidden",
      "api_key=hidden",
    ]) {
      expect(
        getStudioClipsPublicErrorMessage(
          new Error(message),
          "Studio Clips request failed.",
        ),
      ).toBe("Studio Clips request failed.");
    }
  });

  it("does not expose absolute or relative filesystem paths", () => {
    for (const message of [
      "/Users/operator/work/input.mp4 not found",
      "../scratch/input.mp4 could not be opened",
      "C:\\worker\\input.mp4 is missing",
    ]) {
      expect(
        getStudioClipsPublicErrorMessage(
          new Error(message),
          "Studio Clips request failed.",
        ),
      ).toBe("Studio Clips request failed.");
    }
  });

  it("does not expose raw provider, network, or structured dependency errors", () => {
    for (const message of [
      "AssemblyAI 500: upstream database timeout at 10.0.0.4",
      "fetch failed for https://api.provider.test/v1/jobs",
      '{"error":"provider rejected model","request_id":"req_123"}',
      "Studio Clips database query failed: relation outputs does not exist.",
    ]) {
      expect(
        getStudioClipsPublicErrorMessage(
          new Error(message),
          "Studio Clips request failed.",
        ),
      ).toBe("Studio Clips request failed.");
    }
  });
});
