import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeBillingReturnSearch } from "./subscribeBillingReturnSearch";

describe("subscribeBillingReturnSearch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("subscribes to browser history changes and cleans up", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const onStoreChange = vi.fn();
    vi.stubGlobal("window", { addEventListener, removeEventListener });

    const unsubscribe = subscribeBillingReturnSearch(onStoreChange);

    expect(addEventListener).toHaveBeenCalledWith("popstate", onStoreChange);

    unsubscribe();

    expect(removeEventListener).toHaveBeenCalledWith("popstate", onStoreChange);
  });
});
