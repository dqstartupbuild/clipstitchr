import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/tools/[tool]/interaction/route";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

const mocks = vi.hoisted(() => ({
  handlePublicToolInteractionRequest: vi.fn(async () =>
    Response.json({ accepted: true }),
  ),
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/server/handlePublicToolInteractionRequest",
  () => ({
    handlePublicToolInteractionRequest:
      mocks.handlePublicToolInteractionRequest,
  }),
);

describe("POST /api/tools/[tool]/interaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(publicToolKeys)("fixes the %s source at the route", async (tool) => {
    const request = new Request(
      `https://clipstitchr.test/api/tools/${tool}/interaction`,
      { method: "POST" },
    );

    await POST(request, { params: Promise.resolve({ tool }) });

    expect(mocks.handlePublicToolInteractionRequest).toHaveBeenCalledWith(
      request,
      tool,
    );
  });

  it("rejects an unknown tool before the shared handler", async () => {
    const response = await POST(
      new Request("https://clipstitchr.test/api/tools/not-a-tool/interaction", {
        method: "POST",
      }),
      { params: Promise.resolve({ tool: "not-a-tool" }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.handlePublicToolInteractionRequest).not.toHaveBeenCalled();
  });
});
