import { describe, expect, it } from "vitest";
import { getStitchrBatchDate } from "./getStitchrBatchDate";

describe("getStitchrBatchDate", () => {
  it("uses the browser time zone for the batch date", () => {
    expect(
      getStitchrBatchDate(
        "2026-06-23T01:02:03.034Z",
        "America/Detroit",
      ),
    ).toBe("2026-06-22");
  });

  it("falls back to the UTC date when the time zone is invalid", () => {
    expect(
      getStitchrBatchDate("2026-06-23T01:02:03.034Z", "not/a-zone"),
    ).toBe("2026-06-23");
  });
});
