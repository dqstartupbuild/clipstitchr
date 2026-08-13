import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioBetaApiAccessError } from "@/lib/clipstitchr/server/studio/access/StudioBetaApiAccessError";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  assertAccess: vi.fn(),
  getCatalog: vi.fn(),
  readProductId: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess",
  () => ({ assertStudioBetaApiAccess: mocks.assertAccess }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/research/getStudioLazyReelCatalog",
  () => ({ getStudioLazyReelCatalog: mocks.getCatalog }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/research/readStudioLazyReelCatalogProductId",
  () => ({ readStudioLazyReelCatalogProductId: mocks.readProductId }),
);

describe("GET /api/studio/research/catalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ userId: "user-123" });
    mocks.readProductId.mockReturnValue("product-123");
    mocks.getCatalog.mockResolvedValue({
      catalog: { snapshotVersion: "snapshot-1" },
      workflows: [{ key: "video_editor" }],
    });
  });

  it("checks private Studio access before reading the Product", async () => {
    mocks.assertAccess.mockRejectedValue(new StudioBetaApiAccessError(403));

    const response = await GET(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.readProductId).not.toHaveBeenCalled();
    expect(mocks.getCatalog).not.toHaveBeenCalled();
  });

  it("returns the rate-limited catalog and workflow definitions", async () => {
    const response = await GET(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.getCatalog).toHaveBeenCalledWith("product-123");
    await expect(response.json()).resolves.toMatchObject({
      catalog: { snapshotVersion: "snapshot-1" },
      workflows: [{ key: "video_editor" }],
    });
  });
});
