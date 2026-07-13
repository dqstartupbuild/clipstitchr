import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/tools/[tool]/lead/route";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

const mocks = vi.hoisted(() => ({
  handleToolLeadRequest: vi.fn(async () => Response.json({ accepted: true })),
}));

vi.mock(
  "@/lib/clipstitchr/tools/toolLeads/server/handleToolLeadRequest",
  () => ({ handleToolLeadRequest: mocks.handleToolLeadRequest }),
);

describe("POST /api/tools/[tool]/lead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(publicToolKeys)(
    "fixes the %s source at the route boundary",
    async (tool) => {
      const request = new Request(
        `https://clipstitchr.test/api/tools/${tool}/lead`,
        { method: "POST" },
      );

      await expect(
        POST(request, { params: Promise.resolve({ tool }) }),
      ).resolves.toBeInstanceOf(Response);
      expect(mocks.handleToolLeadRequest).toHaveBeenCalledWith({
        request,
        source: tool,
      });
    },
  );

  it("rejects an unknown source before the shared handler", async () => {
    const response = await POST(
      new Request("https://clipstitchr.test/api/tools/not-a-tool/lead", {
        method: "POST",
      }),
      { params: Promise.resolve({ tool: "not-a-tool" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: "Tool not found." });
    expect(mocks.handleToolLeadRequest).not.toHaveBeenCalled();
  });
});
