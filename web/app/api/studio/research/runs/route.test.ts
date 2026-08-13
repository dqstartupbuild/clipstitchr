import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioBetaApiAccessError } from "@/lib/clipstitchr/server/studio/access/StudioBetaApiAccessError";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  assertAccess: vi.fn(),
  readRequest: vi.fn(),
  runTool: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess",
  () => ({ assertStudioBetaApiAccess: mocks.assertAccess }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/lazyreel/http/readStudioLazyReelResearchRunRequest",
  () => ({ readStudioLazyReelResearchRunRequest: mocks.readRequest }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/research/runStudioLazyReelResearchTool",
  () => ({ runStudioLazyReelResearchTool: mocks.runTool }),
);

describe("POST /api/studio/research/runs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ userId: "user-123" });
    mocks.readRequest.mockResolvedValue({
      idempotencyKey: "run-123",
      productId: "product-123",
      request: { tool: "get_status" },
    });
    mocks.runTool.mockResolvedValue({
      created: true,
      result: { title: "Status", tool: "get_status" },
      runId: "run-123",
    });
  });

  it("checks private Studio access before parsing the request", async () => {
    mocks.assertAccess.mockRejectedValue(new StudioBetaApiAccessError(403));

    const response = await POST(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.readRequest).not.toHaveBeenCalled();
    expect(mocks.runTool).not.toHaveBeenCalled();
  });

  it("returns the persisted structured result", async () => {
    const response = await POST(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toMatchObject({
      created: true,
      runId: "run-123",
      result: { tool: "get_status" },
    });
  });
});
