import { describe, expect, it } from "vitest";
import { getAvatarPhotoGenerationModelFamily } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationModelFamily";

describe("getAvatarPhotoGenerationModelFamily", () => {
  it("detects MiniMax Image-01 avatar models", () => {
    expect(getAvatarPhotoGenerationModelFamily("minimax/image-01")).toBe(
      "minimax-image-01",
    );
  });

  it("detects versioned MiniMax Image-01 avatar models", () => {
    expect(
      getAvatarPhotoGenerationModelFamily("minimax/image-01:version-id"),
    ).toBe("minimax-image-01");
  });

  it("uses the OpenAI GPT Image workflow by default", () => {
    expect(getAvatarPhotoGenerationModelFamily("openai/gpt-image-2")).toBe(
      "openai-gpt-image",
    );
  });
});
