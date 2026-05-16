import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/lib/resolveSiteUrl";

describe("resolveSiteUrl", () => {
  it("uses localhost when no deployment URL is configured", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });

  it("uses the configured site URL outside Vercel preview deployments", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://clipstitchr.com",
      }),
    ).toBe("https://clipstitchr.com");
  });

  it("uses Vercel branch URLs for preview deployments", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://clipstitchr.com",
        VERCEL_BRANCH_URL: "preview.clipstitchr.com",
        VERCEL_ENV: "preview",
      }),
    ).toBe("https://preview.clipstitchr.com");
  });

  it("allows an explicit preview URL override", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_PREVIEW_SITE_URL: "https://preview.clipstitchr.com",
        VERCEL_BRANCH_URL: "generated-branch-url.vercel.app",
        VERCEL_ENV: "preview",
      }),
    ).toBe("https://preview.clipstitchr.com");
  });

  it("uses Vercel production URLs for production deployments", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "clipstitchr.com",
      }),
    ).toBe("https://clipstitchr.com");
  });
});
