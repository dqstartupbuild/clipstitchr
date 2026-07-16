import { describe, expect, it } from "vitest";
import { getBillingReturnServerSnapshot } from "./getBillingReturnServerSnapshot";

describe("getBillingReturnServerSnapshot", () => {
  it("keeps the server and first hydration render free of browser-only search state", () => {
    expect(getBillingReturnServerSnapshot()).toBeNull();
  });
});
