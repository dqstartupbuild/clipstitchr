import { describe, expect, it } from "vitest";
import { createStudioLazyReelJsonResponse } from "./createStudioLazyReelJsonResponse";

describe("createStudioLazyReelJsonResponse", () => {
  it("marks private research results no-store", async () => {
    const response = createStudioLazyReelJsonResponse(
      { result: "private" },
      { headers: { "x-request-id": "request-1" }, status: 201 },
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-request-id")).toBe("request-1");
    await expect(response.json()).resolves.toEqual({ result: "private" });
  });
});
