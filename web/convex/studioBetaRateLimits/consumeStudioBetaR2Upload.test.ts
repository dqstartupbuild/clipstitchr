import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeStudioBetaR2Upload } from "./consumeStudioBetaR2Upload";

type ConvexFunction = {
  handler: (
    ctx: unknown,
    args: { productId: string; secret: string; sizeBytes: number },
  ) => Promise<void>;
};

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  auth: vi.fn(),
  limit: vi.fn(),
  mutation: vi.fn((definition) => definition),
  product: vi.fn(),
  secret: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.secret,
}));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.auth,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: { limit: mocks.limit } }));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.access,
}));
vi.mock("./assertStudioBetaR2ActiveProduct", () => ({
  assertStudioBetaR2ActiveProduct: mocks.product,
}));

describe("consumeStudioBetaR2Upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
  });

  it("checks access and Product ownership before reserving URL and bytes", async () => {
    const context = {};
    const handler = (consumeStudioBetaR2Upload as unknown as ConvexFunction)
      .handler;

    await handler(context, {
      productId: "product_1",
      secret: "rate-secret",
      sizeBytes: 1024.2,
    });

    expect(mocks.secret).toHaveBeenCalledWith("rate-secret");
    expect(mocks.access).toHaveBeenCalledWith(context, "owner_1");
    expect(mocks.product).toHaveBeenCalledWith(
      context,
      "owner_1",
      "product_1",
    );
    expect(mocks.limit).toHaveBeenNthCalledWith(1, context, "r2UploadUrl", {
      key: "owner_1",
      throws: true,
    });
    expect(mocks.limit).toHaveBeenNthCalledWith(2, context, "r2UploadBytes", {
      count: 1025,
      key: "owner_1",
      throws: true,
    });
  });
});
