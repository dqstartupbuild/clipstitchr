import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  enabled: vi.fn(),
  mutation: vi.fn(),
}));
const originalDispatchAccessSecret =
  process.env.STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET;

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: () => ({ mutation: mocks.mutation }),
}));
vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));
vi.mock("@/lib/clipstitchr/studio/access/getStudioBetaGlobalEnabled", () => ({
  getStudioBetaGlobalEnabled: mocks.enabled,
}));

const createRequest = (secret: string, body: unknown) =>
  new Request(
    "https://clipstitchr.test/api/studio/publishing/internal/dispatch-access",
    {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "x-clipstitchr-publishing-dispatch-secret": secret,
      },
      method: "POST",
    },
  );

describe("publishing dispatch access route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET =
      "dispatch-access-secret-placeholder-2026";
    mocks.enabled.mockReturnValue(true);
    mocks.mutation.mockResolvedValue({ allowed: true });
  });

  afterEach(() => {
    if (originalDispatchAccessSecret === undefined) {
      delete process.env.STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET;
      return;
    }

    process.env.STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET =
      originalDispatchAccessSecret;
  });

  it("passes only the secret-gated owner and Product scope to Convex", async () => {
    const response = await POST(
      createRequest("dispatch-access-secret-placeholder-2026", {
        ownerId: "user_123",
        productId: "product_123",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({ allowed: true });
    expect(mocks.mutation).toHaveBeenCalledWith(expect.anything(), {
      ownerId: "user_123",
      productId: "product_123",
      secret: "rate-limit-secret",
    });
  });

  it("fails closed before Convex when the web switch is off", async () => {
    mocks.enabled.mockReturnValue(false);
    const response = await POST(
      createRequest("dispatch-access-secret-placeholder-2026", {
        ownerId: "user_123",
        productId: "product_123",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ allowed: false });
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret, extra fields, and unavailable Convex", async () => {
    const unauthorized = await POST(
      createRequest("wrong-secret", {
        ownerId: "user_123",
        productId: "product_123",
      }),
    );
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers.get("cache-control")).toBe(
      "private, no-store",
    );

    const malformed = await POST(
      createRequest("dispatch-access-secret-placeholder-2026", {
        ownerId: "user_123",
        productId: "product_123",
        ignored: true,
      }),
    );
    expect(malformed.status).toBe(400);

    mocks.mutation.mockRejectedValueOnce(new Error("Convex unavailable"));
    const unavailable = await POST(
      createRequest("dispatch-access-secret-placeholder-2026", {
        ownerId: "user_123",
        productId: "product_123",
      }),
    );
    expect(unavailable.status).toBe(503);
    await expect(unavailable.json()).resolves.toEqual({ allowed: false });
  });
});
