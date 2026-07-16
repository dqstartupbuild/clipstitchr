import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  getIsAuthorizedAutomationRequest: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/automation/getIsAuthorizedAutomationRequest",
  () => ({
    getIsAuthorizedAutomationRequest: mocks.getIsAuthorizedAutomationRequest,
  }),
);

describe("POST /api/automation/clipr/execute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getIsAuthorizedAutomationRequest.mockReturnValue(true);
  });

  it("rejects unauthorized worker requests", async () => {
    mocks.getIsAuthorizedAutomationRequest.mockReturnValue(false);

    const response = await POST(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(401);
  });

  it("retires the direct provider route in favor of the plan-aware queue", async () => {
    const response = await POST(new Request("https://clipstitchr.test"));

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      message:
        "Clipr automation now runs through the plan-aware provider queue.",
    });
  });
});
