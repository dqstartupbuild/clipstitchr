import { afterEach, describe, expect, it, vi } from "vitest";
import { getBillingReturnSearch } from "./getBillingReturnSearch";

describe("getBillingReturnSearch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the billing result from the current URL", () => {
    vi.stubGlobal("window", {
      location: { search: "?billing=refill-success" },
    });

    expect(getBillingReturnSearch()).toBe("refill-success");
  });
});
