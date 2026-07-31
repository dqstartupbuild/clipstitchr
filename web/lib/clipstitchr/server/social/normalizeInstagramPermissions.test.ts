import { describe, expect, it } from "vitest";
import { normalizeInstagramPermissions } from "./normalizeInstagramPermissions";

describe("normalizeInstagramPermissions", () => {
  it("keeps permissions returned as an array", () => {
    expect(
      normalizeInstagramPermissions([
        "instagram_business_basic",
        "instagram_business_content_publish",
      ]),
    ).toEqual([
      "instagram_business_basic",
      "instagram_business_content_publish",
    ]);
  });

  it("supports comma-separated permission responses", () => {
    expect(
      normalizeInstagramPermissions(
        "instagram_business_basic, instagram_business_manage_insights",
      ),
    ).toEqual([
      "instagram_business_basic",
      "instagram_business_manage_insights",
    ]);
  });
});
