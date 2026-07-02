import { describe, expect, it } from "vitest";
import { createManualContentAnalyticsSyncWarning } from "@/lib/clipstitchr/server/apify/createManualContentAnalyticsSyncWarning";

describe("createManualContentAnalyticsSyncWarning", () => {
  it("returns no warning when every manual analytics item syncs cleanly", () => {
    expect(
      createManualContentAnalyticsSyncWarning({
        failedAccountCount: 0,
        skippedItemCount: 0,
      }),
    ).toBeNull();
  });

  it("explains account-level manual sync failures without hiding Post Bridge results", () => {
    expect(
      createManualContentAnalyticsSyncWarning({
        failedAccountCount: 1,
        skippedItemCount: 0,
      }),
    ).toBe(
      "Manual analytics could not sync for some accounts. Your Post Bridge results are still here, and you can try again.",
    );
  });

  it("explains skipped manual items while keeping valid rows", () => {
    expect(
      createManualContentAnalyticsSyncWarning({
        failedAccountCount: 0,
        skippedItemCount: 2,
      }),
    ).toBe("Some manual posts could not be read. We kept the posts we could read.");
  });
});
