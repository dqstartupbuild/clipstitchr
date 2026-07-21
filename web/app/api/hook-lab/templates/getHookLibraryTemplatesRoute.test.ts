import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHookLibraryTemplatesRoute } from "./getHookLibraryTemplatesRoute";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

describe("getHookLibraryTemplatesRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
  });

  it("requires an authenticated user", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await getHookLibraryTemplatesRoute(
      new Request("https://clipstitchr.test/api/hook-lab/templates"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
  });

  it("returns a filtered and paginated library response", async () => {
    const response = await getHookLibraryTemplatesRoute(
      new Request(
        "https://clipstitchr.test/api/hook-lab/templates?category=before_after_arc&page=2",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, max-age=60");
    expect(body.page).toBe(2);
    expect(body.items.length).toBeLessThanOrEqual(24);
    expect(
      body.items.every(
        (item: { categoryKey: string }) =>
          item.categoryKey === "before_after_arc",
      ),
    ).toBe(true);
  });
});
