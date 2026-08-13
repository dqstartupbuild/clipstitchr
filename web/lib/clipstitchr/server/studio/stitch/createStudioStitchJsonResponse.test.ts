import { describe, expect, it } from "vitest";
import { createStudioStitchJsonResponse } from "./createStudioStitchJsonResponse";

describe("createStudioStitchJsonResponse", () => {
  it("marks authenticated lifecycle responses private and no-store", () => {
    const response = createStudioStitchJsonResponse({ status: "intentReady" });

    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
