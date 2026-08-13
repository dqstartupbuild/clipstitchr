import { beforeEach, describe, expect, it, vi } from "vitest";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  createClient: vi.fn(),
  getIdentity: vi.fn(),
  getToken: vi.fn(),
  mutation: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    studioPublishingScope: {
      getActiveProductScope: {
        getActiveProductScope: "get-active-product-scope",
      },
    },
  },
}));
vi.mock(
  "@/lib/clipstitchr/publishing/identity/getAuthenticatedPublishingTenantIdentity",
  () => ({ getAuthenticatedPublishingTenantIdentity: mocks.getIdentity }),
);
vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({ createAuthenticatedConvexHttpClient: mocks.createClient }),
);
vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getToken,
}));
vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess",
  () => ({ assertStudioBetaApiAccess: mocks.access }),
);

describe("requirePublishingProxyAuthentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.access.mockResolvedValue({ userId: "user_1" });
    mocks.getIdentity.mockResolvedValue({
      actorUserId: "user_1",
      tenantKey: "personal:user_1",
    });
    mocks.getToken.mockResolvedValue("convex-token");
    mocks.createClient.mockReturnValue({ mutation: mocks.mutation });
    mocks.mutation.mockResolvedValue({
      ownerId: "user_1",
      productId: "product_1",
      productName: "Everyday bottle",
    });
  });

  it("binds the publishing gateway to Studio and the current Product", async () => {
    await expect(requirePublishingProxyAuthentication()).resolves.toMatchObject({
      ownerId: "user_1",
      productId: "product_1",
      productName: "Everyday bottle",
      userId: "user_1",
    });
    expect(mocks.createClient).toHaveBeenCalledWith("convex-token");
    expect(mocks.mutation).toHaveBeenCalledWith(
      "get-active-product-scope",
      {},
    );
  });

  it("fails closed when Clerk cannot mint a Convex token", async () => {
    mocks.getToken.mockResolvedValue(null);

    await expect(requirePublishingProxyAuthentication()).rejects.toThrow(
      "Unable to verify",
    );
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
