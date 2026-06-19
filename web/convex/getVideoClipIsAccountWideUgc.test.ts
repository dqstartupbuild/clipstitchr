import { describe, expect, it } from "vitest";
import { getVideoClipIsAccountWideUgc } from "./getVideoClipIsAccountWideUgc";

describe("getVideoClipIsAccountWideUgc", () => {
  it("treats plain uploaded UGC as account-wide", () => {
    expect(
      getVideoClipIsAccountWideUgc({
        clipType: "ugc",
      }),
    ).toBe(true);
  });

  it("keeps generated and demo clips out of the account-wide UGC pool", () => {
    expect(
      getVideoClipIsAccountWideUgc({
        clipType: "ugc",
        cliprMetadata: { jobId: "job_1" },
      }),
    ).toBe(false);
    expect(
      getVideoClipIsAccountWideUgc({
        clipType: "ugc",
        swaprMetadata: { source: "swapr" },
      }),
    ).toBe(false);
    expect(
      getVideoClipIsAccountWideUgc({
        clipType: "demo",
      }),
    ).toBe(false);
  });
});
