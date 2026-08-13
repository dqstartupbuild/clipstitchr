import { describe, expect, it } from "vitest";
import { createStudioClipsPrivateJsonResponse } from "./createStudioClipsPrivateJsonResponse";

describe("createStudioClipsPrivateJsonResponse", () => {
  it("marks authenticated JSON private and non-cacheable while preserving headers", async () => {
    const response = createStudioClipsPrivateJsonResponse(
      { ok: true },
      { headers: { "Retry-After": "4" }, status: 202 },
    );

    expect(response.status).toBe(202);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Retry-After")).toBe("4");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
