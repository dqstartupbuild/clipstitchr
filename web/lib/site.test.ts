import { describe, expect, it } from "vitest";
import { brandAssets } from "@/lib/brandAssets";
import {
  createOgAssetPath,
  createOrganizationJsonLd,
} from "@/lib/site";

describe("site brand metadata", () => {
  it("uses the versioned open graph fallback", () => {
    expect(createOgAssetPath("/")).toBe("/og/v2/default.png");
  });

  it("publishes the v2 icon in organization structured data", () => {
    const organization = createOrganizationJsonLd();

    expect(organization.logo.url).toContain(brandAssets.icon512);
    expect(organization.contactPoint).toMatchObject({
      contactType: "customer support",
      email: "support@followusai.com",
    });
    expect(organization.address).toMatchObject({
      "@type": "PostalAddress",
      addressCountry: "US",
    });
  });
});
