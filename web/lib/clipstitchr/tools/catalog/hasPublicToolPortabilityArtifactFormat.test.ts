import { describe, expect, it } from "vitest";
import { hasPublicToolPortabilityArtifactFormat } from "@/lib/clipstitchr/tools/catalog/hasPublicToolPortabilityArtifactFormat";

describe("hasPublicToolPortabilityArtifactFormat", () => {
  it("matches only the approved portability artifact format", () => {
    expect(
      hasPublicToolPortabilityArtifactFormat(
        "app-ad-teardown-library",
        "markdown",
      ),
    ).toBe(true);
    expect(
      hasPublicToolPortabilityArtifactFormat(
        "app-ad-hook-structures",
        "markdown",
      ),
    ).toBe(false);
    expect(
      hasPublicToolPortabilityArtifactFormat("app-hook-generator", "copy"),
    ).toBe(false);
  });
});
