import { describe, expect, it } from "vitest";
import { getClipStitchrDeploymentEnvironmentIsVercelCompatible } from "./getClipStitchrDeploymentEnvironmentIsVercelCompatible";

describe("getClipStitchrDeploymentEnvironmentIsVercelCompatible", () => {
  it("matches production and non-production Vercel environments explicitly", () => {
    expect(
      getClipStitchrDeploymentEnvironmentIsVercelCompatible(
        "production",
        "production",
      ),
    ).toBe(true);
    expect(
      getClipStitchrDeploymentEnvironmentIsVercelCompatible(
        "development",
        "preview",
      ),
    ).toBe(true);
    expect(
      getClipStitchrDeploymentEnvironmentIsVercelCompatible(
        "development",
        "production",
      ),
    ).toBe(false);
    expect(
      getClipStitchrDeploymentEnvironmentIsVercelCompatible(
        "development",
        "staging",
      ),
    ).toBe(false);
  });

  it("allows non-Vercel runtimes to use the explicit deployment value", () => {
    expect(
      getClipStitchrDeploymentEnvironmentIsVercelCompatible(
        "development",
        undefined,
      ),
    ).toBe(true);
  });
});
