import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioBetaApiAccessError } from "@/lib/clipstitchr/server/studio/access/StudioBetaApiAccessError";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  assertAccess: vi.fn(),
  readRequest: vi.fn(),
  runWorkflow: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess",
  () => ({ assertStudioBetaApiAccess: mocks.assertAccess }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/lazyreel/http/readStudioLazyReelWorkflowRunRequest",
  () => ({ readStudioLazyReelWorkflowRunRequest: mocks.readRequest }),
);
vi.mock(
  "@/lib/clipstitchr/server/studio/research/runStudioLazyReelWorkflow",
  () => ({ runStudioLazyReelWorkflow: mocks.runWorkflow }),
);

describe("POST /api/studio/research/workflows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ userId: "user-123" });
    mocks.readRequest.mockResolvedValue({
      idempotencyKey: "workflow-123",
      productId: "product-123",
      request: { brief: "Plan this", workflow: "video_editor" },
    });
    mocks.runWorkflow.mockResolvedValue({
      created: true,
      result: {
        data: { executionStatus: "plan_only" },
        title: "Video editor",
        workflow: "video_editor",
      },
      runId: "workflow-123",
    });
  });

  it("checks private Studio access before parsing the workflow", async () => {
    mocks.assertAccess.mockRejectedValue(new StudioBetaApiAccessError(401));

    const response = await POST(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.readRequest).not.toHaveBeenCalled();
  });

  it("returns an explicitly plan-only workflow result", async () => {
    const response = await POST(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toMatchObject({
      result: { data: { executionStatus: "plan_only" } },
      runId: "workflow-123",
    });
  });
});
