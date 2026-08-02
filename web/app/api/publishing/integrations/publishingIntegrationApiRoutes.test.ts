import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE as disconnectIntegration } from "@/app/api/publishing/integrations/[integrationId]/route";
import { POST as connectIntegration } from "@/app/api/publishing/integrations/[integrationId]/connect/route";
import { POST as refreshIntegration } from "@/app/api/publishing/integrations/[integrationId]/refresh/route";
import { GET as listIntegrations } from "@/app/api/publishing/integrations/route";
import { GET as getTikTokCreatorInfo } from "@/app/api/publishing/integrations/tiktok/creator-info/route";
import { GET as completeOAuthCallback } from "@/app/api/publishing/oauth/[provider]/callback/route";
import { PublishingAuthenticationError } from "@/lib/clipstitchr/publishing/identity/PublishingAuthenticationError";

const mocks = vi.hoisted(() => ({
  requestPublishingService: vi.fn(),
  requirePublishingProxyAuthentication: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/publishing/service/requestPublishingService",
  () => ({ requestPublishingService: mocks.requestPublishingService }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication",
  () => ({
    requirePublishingProxyAuthentication:
      mocks.requirePublishingProxyAuthentication,
  }),
);

const state = "A".repeat(43);
const serviceResponse = (body: unknown) => ({
  body,
  retryAfterSeconds: undefined,
  status: 200,
});

describe("publishing integration API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://clipstitchr.test");
    mocks.requirePublishingProxyAuthentication.mockResolvedValue(undefined);
  });

  it("Clerk-protects the integration list before calling the service", async () => {
    mocks.requirePublishingProxyAuthentication.mockRejectedValueOnce(
      new PublishingAuthenticationError(),
    );
    const response = await listIntegrations();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "authentication_required",
    });
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });

  it("uses the integration-read assertion contract and returns no-store JSON", async () => {
    const body = {
      providers: [
        { canConnect: true, integrations: [], provider: "instagram", unavailableReason: null },
        { canConnect: true, integrations: [], provider: "tiktok", unavailableReason: null },
      ],
    };
    mocks.requestPublishingService.mockResolvedValueOnce(serviceResponse(body));
    const response = await listIntegrations();

    expect(mocks.requestPublishingService).toHaveBeenCalledWith({
      action: "publishing.integrations.read",
      method: "GET",
      path: "/v1/integrations",
    });
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual(body);
  });

  it("forwards only the two public providers and a bounded JSON connect body", async () => {
    mocks.requestPublishingService.mockResolvedValueOnce(
      serviceResponse({
        authorizationUrl:
          "https://www.instagram.com/oauth/authorize?client_id=id&state=state",
      }),
    );
    const response = await connectIntegration(
      new Request(
        "https://clipstitchr.test/api/publishing/integrations/instagram/connect",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            returnPath: "/dashboard/publishing/integrations",
          }),
        },
      ),
      { params: Promise.resolve({ integrationId: "instagram" }) },
    );

    expect(response.status).toBe(200);
    expect(mocks.requestPublishingService).toHaveBeenCalledWith({
      action: "publishing.integrations.connect",
      body: { returnPath: "/dashboard/publishing/integrations" },
      method: "POST",
      path: "/v1/integrations/instagram/connect",
    });

    const unsupported = await connectIntegration(
      new Request(
        "https://clipstitchr.test/api/publishing/integrations/youtube/connect",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      ),
      { params: Promise.resolve({ integrationId: "youtube" }) },
    );
    expect(unsupported.status).toBe(404);
    expect(mocks.requestPublishingService).toHaveBeenCalledTimes(1);
  });

  it("forwards refresh, disconnect, and creator-info with distinct actions", async () => {
    mocks.requestPublishingService.mockResolvedValue(serviceResponse({ ok: true }));

    await refreshIntegration(
      new Request("https://clipstitchr.test", { method: "POST" }),
      { params: Promise.resolve({ integrationId: "integration_123" }) },
    );
    await disconnectIntegration(
      new Request("https://clipstitchr.test", { method: "DELETE" }),
      { params: Promise.resolve({ integrationId: "integration_123" }) },
    );
    await getTikTokCreatorInfo(
      new Request(
        "https://clipstitchr.test/api/publishing/integrations/tiktok/creator-info?integrationId=integration_123",
      ),
    );

    expect(mocks.requestPublishingService.mock.calls).toEqual([
      [
        {
          action: "publishing.integrations.refresh",
          method: "POST",
          path: "/v1/integrations/integration_123/refresh",
        },
      ],
      [
        {
          action: "publishing.integrations.disconnect",
          method: "DELETE",
          path: "/v1/integrations/integration_123",
        },
      ],
      [
        {
          action: "publishing.status.poll",
          method: "GET",
          path: "/v1/integrations/tiktok/creator-info",
          searchParams: { integrationId: "integration_123" },
        },
      ],
    ]);
  });

  it("rejects bodies on no-body routes and bounds creator-info queries", async () => {
    const refresh = await refreshIntegration(
      new Request("https://clipstitchr.test", {
        body: "{}",
        method: "POST",
      }),
      { params: Promise.resolve({ integrationId: "integration_123" }) },
    );
    const disconnect = await disconnectIntegration(
      new Request("https://clipstitchr.test", {
        body: "{}",
        method: "DELETE",
      }),
      { params: Promise.resolve({ integrationId: "integration_123" }) },
    );
    const oversizedQuery = await getTikTokCreatorInfo(
      new Request(
        `https://clipstitchr.test/api/publishing/integrations/tiktok/creator-info?integrationId=${"a".repeat(4_096)}`,
      ),
    );

    expect(refresh.status).toBe(400);
    expect(disconnect.status).toBe(400);
    expect(oversizedQuery.status).toBe(414);
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });

  it("consumes callback data through the service and redirects without echoing it", async () => {
    mocks.requestPublishingService.mockResolvedValueOnce(
      serviceResponse({ connectedCount: 1, outcome: "connected" }),
    );
    const response = await completeOAuthCallback(
      new Request(
        `https://clipstitchr.test/api/publishing/oauth/tiktok/callback?code=private-code&state=${state}`,
      ),
      { params: Promise.resolve({ provider: "tiktok" }) },
    );

    expect(mocks.requestPublishingService).toHaveBeenCalledWith({
      action: "publishing.integrations.callback",
      body: { code: "private-code", state },
      method: "POST",
      path: "/v1/integrations/tiktok/callback",
    });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://clipstitchr.test/dashboard/publishing/integrations?connection=connected",
    );
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("location")).not.toContain("private-code");
    expect(response.headers.get("location")).not.toContain(state);
    await expect(response.text()).resolves.toBe("");
  });

  it("consumes provider denial once without forwarding its description", async () => {
    mocks.requestPublishingService.mockResolvedValueOnce(
      serviceResponse({ outcome: "cancelled" }),
    );
    const response = await completeOAuthCallback(
      new Request(
        `https://clipstitchr.test/api/publishing/oauth/instagram/callback?error=access_denied&error_description=private-provider-detail&state=${state}`,
      ),
      { params: Promise.resolve({ provider: "instagram" }) },
    );

    expect(mocks.requestPublishingService).toHaveBeenCalledWith({
      action: "publishing.integrations.callback",
      body: { denied: true, state },
      method: "POST",
      path: "/v1/integrations/instagram/callback",
    });
    expect(response.headers.get("location")).toContain("connection=cancelled");
    expect(response.headers.get("location")).not.toContain("private-provider-detail");
  });

  it("fails closed on duplicate callback fields and never leaks thrown secrets", async () => {
    const duplicate = await completeOAuthCallback(
      new Request(
        `https://clipstitchr.test/api/publishing/oauth/tiktok/callback?code=one&state=${state}&state=${state}`,
      ),
      { params: Promise.resolve({ provider: "tiktok" }) },
    );
    expect(duplicate.headers.get("location")).toContain("connection=failed");
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();

    const contradictory = await completeOAuthCallback(
      new Request(
        `https://clipstitchr.test/api/publishing/oauth/tiktok/callback?code=one&error_description=private-detail&state=${state}`,
      ),
      { params: Promise.resolve({ provider: "tiktok" }) },
    );
    expect(contradictory.headers.get("location")).toContain(
      "connection=failed",
    );
    expect(contradictory.headers.get("location")).not.toContain(
      "private-detail",
    );
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();

    mocks.requestPublishingService.mockRejectedValueOnce(
      new Error("code=private-code&state=private-state&token=private-token"),
    );
    const failed = await completeOAuthCallback(
      new Request(
        `https://clipstitchr.test/api/publishing/oauth/tiktok/callback?code=private-code&state=${state}`,
      ),
      { params: Promise.resolve({ provider: "tiktok" }) },
    );
    const location = failed.headers.get("location") ?? "";
    expect(location).toContain("connection=failed");
    expect(location).not.toContain("private-code");
    expect(location).not.toContain("private-state");
    expect(location).not.toContain("private-token");
  });
});
