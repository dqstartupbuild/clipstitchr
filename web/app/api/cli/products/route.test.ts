import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/cli/products/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn(), query: vi.fn() };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    getCliSessionFromRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    cliProducts: {
      createCliProduct: {
        createCliProduct: "cliProducts.createCliProduct",
      },
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/cli/getCliSessionFromRequest", () => ({
  getCliSessionFromRequest: mocks.getCliSessionFromRequest,
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest() {
  return new Request("https://clipstitchr.test/api/cli/products", {
    body: JSON.stringify({
      audienceDetails: "Founders",
      name: "Launch Kit",
      ownerId: "attacker_selected_owner",
      productDetails: "AI launch planner",
    }),
    method: "POST",
  });
}

describe("POST /api/cli/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createId.mockReturnValue("product_123");
    mocks.getCliSessionFromRequest.mockResolvedValue({ ownerId: "owner_123" });
    mocks.convex.mutation.mockResolvedValue({
      id: "product_123",
      name: "Launch Kit",
    });
  });

  it("returns 401 before product creation when the CLI session is missing", async () => {
    mocks.getCliSessionFromRequest.mockResolvedValueOnce(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.createConvexHttpClient).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("uses the authenticated owner and lets Convex own lifecycle time", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      product: { id: "product_123", name: "Launch Kit" },
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliProducts.createCliProduct.createCliProduct,
      {
        audienceDetails: "Founders",
        id: "product_123",
        name: "Launch Kit",
        ownerId: "owner_123",
        productDetails: "AI launch planner",
        secret: "rate-limit-secret",
      },
    );
  });

  it("returns the human product-limit message from Convex", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        code: "PRODUCT_LIMIT_REACHED",
        message:
          "Starter includes 1 active product. Archive one or change your plan to add another.",
      },
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message:
        "Starter includes 1 active product. Archive one or change your plan to add another.",
    });
    expect(response.status).toBe(400);
  });
});
