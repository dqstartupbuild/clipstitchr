import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { StudioBetaApiAccessError } from "@/lib/clipstitchr/server/studio/access/StudioBetaApiAccessError";

const mocks = vi.hoisted(() => ({ assertAccess: vi.fn() }));

vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess",
  () => ({ assertStudioBetaApiAccess: mocks.assertAccess }),
);

describe("GET /api/studio/access", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 for a guessed unauthenticated API path", async () => {
    mocks.assertAccess.mockRejectedValue(new StudioBetaApiAccessError(401));

    const response = await GET();

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required.",
    });
  });

  it("returns 403 for an authenticated but ineligible account", async () => {
    mocks.assertAccess.mockRejectedValue(new StudioBetaApiAccessError(403));

    const response = await GET();

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Studio Beta access is unavailable.",
    });
  });

  it("returns a minimal success response after all gates pass", async () => {
    mocks.assertAccess.mockResolvedValue({ userId: "user_123" });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({ access: "granted" });
  });
});
