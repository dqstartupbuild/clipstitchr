import { describe, expect, it } from "vitest";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";

describe("getReplicatePredictionModelReference", () => {
  it("uses model references for unversioned Replicate models", () => {
    expect(
      getReplicatePredictionModelReference("openai/gpt-image-2"),
    ).toEqual({
      model: "openai/gpt-image-2",
    });
  });

  it("uses version references for owner/model:version Replicate IDs", () => {
    expect(
      getReplicatePredictionModelReference(
        "prunaai/z-image-turbo-img2img:5c958e90e0f904240629ee35c69196e3bd790b5528c0696705ebdb1656871dd8",
      ),
    ).toEqual({
      version:
        "5c958e90e0f904240629ee35c69196e3bd790b5528c0696705ebdb1656871dd8",
    });
  });
});
