import { describe, expect, it } from "vitest";
import { resolveConvexCloudUrl } from "./resolveConvexCloudUrl";

describe("resolveConvexCloudUrl", () => {
  it("prefers the server-only Convex URL", () => {
    expect(
      resolveConvexCloudUrl({
        CONVEX_URL: "https://server-deployment.convex.cloud",
        NEXT_PUBLIC_CONVEX_URL: "https://public-deployment.convex.cloud",
      }),
    ).toBe("https://server-deployment.convex.cloud");
  });

  it("accepts NEXT_PUBLIC_CONVEX_URL as a fallback", () => {
    expect(
      resolveConvexCloudUrl({
        NEXT_PUBLIC_CONVEX_URL: "https://public-deployment.convex.cloud",
      }),
    ).toBe("https://public-deployment.convex.cloud");
  });

  it("rejects Convex site URLs and unrelated proxies", () => {
    expect(() =>
      resolveConvexCloudUrl({
        CONVEX_URL: "https://server-deployment.convex.site",
      }),
    ).toThrow("Convex URL must be a valid .convex.cloud URL.");
    expect(() =>
      resolveConvexCloudUrl({
        CONVEX_URL: "https://example.com/api/convex",
      }),
    ).toThrow("Convex URL must be a valid .convex.cloud URL.");
  });
});
