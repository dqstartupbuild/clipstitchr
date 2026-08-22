import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { developmentAuthBypassHeaderName } from "@/lib/clipstitchr/development/auth/developmentAuthBypassHeaderName";

const mocks = vi.hoisted(() => ({
  runClerkProtectedProxy: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/development/auth/runClerkProtectedProxy",
  () => ({
    runClerkProtectedProxy: mocks.runClerkProtectedProxy,
  }),
);

describe("proxy development auth bypass", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "true");
    mocks.runClerkProtectedProxy.mockResolvedValue(
      new Response("Protected", { status: 401 }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("allows loopback dashboard page navigation and marks the upstream request", async () => {
    const { default: proxy } = await import("@/proxy");
    const response = await proxy(
      new NextRequest("http://localhost:3000/dashboard/library"),
      {} as never,
    );

    expect(response?.status).toBe(200);
    expect(response?.headers.get("x-middleware-next")).toBe("1");
    expect(
      response?.headers.get(
        `x-middleware-request-${developmentAuthBypassHeaderName}`,
      ),
    ).toBe("1");
    expect(mocks.runClerkProtectedProxy).not.toHaveBeenCalled();
  });

  it("rewrites markdown-preferred public pages and varies by Accept", async () => {
    const { default: proxy } = await import("@/proxy");
    const response = await proxy(
      new NextRequest("http://localhost:3000/developers", {
        headers: { accept: "text/markdown, text/html;q=0.5" },
      }),
      {} as never,
    );

    expect(response?.status).toBe(200);
    expect(response?.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response?.headers.get("vary")).toBe(
      "Accept, Accept-Encoding",
    );
    await expect(response?.text()).resolves.toContain(
      "# ClipStitchr Developer Resources",
    );
    expect(mocks.runClerkProtectedProxy).not.toHaveBeenCalled();
  });

  it("returns a negotiated markdown 404 with recovery links", async () => {
    const { default: proxy } = await import("@/proxy");
    const response = await proxy(
      new NextRequest("http://localhost:3000/not-a-real-page", {
        headers: { accept: "text/markdown" },
      }),
      {} as never,
    );

    expect(response?.status).toBe(404);
    await expect(response?.text()).resolves.toContain("/sitemap.xml");
    expect(mocks.runClerkProtectedProxy).not.toHaveBeenCalled();
  });

  it("keeps machine-readable resources on their native routes", async () => {
    const { default: proxy } = await import("@/proxy");

    for (const pathname of [
      "/llms.txt",
      "/openapi.json",
      "/sitemap.xml",
      "/api/v1",
      "/api/v1/hooks",
    ]) {
      mocks.runClerkProtectedProxy.mockClear();
      const response = await proxy(
        new NextRequest(`http://localhost:3000${pathname}`, {
          headers: { accept: "text/markdown" },
        }),
        {} as never,
      );
      expect(response?.headers.get("x-middleware-next")).toBe("1");
      expect(mocks.runClerkProtectedProxy).not.toHaveBeenCalled();
    }
  });

  it("falls back to acceptable HTML for an HTML-only public page", async () => {
    const { default: proxy } = await import("@/proxy");
    await proxy(
      new NextRequest("http://localhost:3000/docs", {
        headers: { accept: "text/markdown, text/html;q=0.5" },
      }),
      {} as never,
    );

    expect(mocks.runClerkProtectedProxy).toHaveBeenCalledOnce();
  });

  it("varies negotiated HTML responses by Accept", async () => {
    const { default: proxy } = await import("@/proxy");
    const response = await proxy(
      new NextRequest("http://localhost:3000/", {
        headers: { accept: "text/html" },
      }),
      {} as never,
    );

    expect(response?.headers.get("vary")).toBe(
      "Accept, Accept-Encoding",
    );
    expect(mocks.runClerkProtectedProxy).toHaveBeenCalledOnce();
  });

  it("returns 406 when no page representation is acceptable", async () => {
    const { default: proxy } = await import("@/proxy");
    const response = await proxy(
      new NextRequest("http://localhost:3000/docs", {
        headers: { accept: "text/markdown" },
      }),
      {} as never,
    );

    expect(response?.status).toBe(406);
    expect(response?.headers.get("vary")).toBe(
      "Accept, Accept-Encoding",
    );
    expect(mocks.runClerkProtectedProxy).not.toHaveBeenCalled();
  });

  it("denies API routes instead of granting preview access", async () => {
    const { default: proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/api/r2/upload-url");
    const response = await proxy(request, {} as never);

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      error:
        "Development preview does not authorize API or server-action access.",
    });
    expect(mocks.runClerkProtectedProxy).not.toHaveBeenCalled();
  });

  it("denies dashboard POST requests instead of granting preview access", async () => {
    const { default: proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/dashboard", {
      method: "POST",
    });
    const response = await proxy(request, {} as never);

    expect(response?.status).toBe(401);
    expect(mocks.runClerkProtectedProxy).not.toHaveBeenCalled();
  });

  it("fails closed for production and non-loopback dashboard requests", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { default: productionProxy } = await import("@/proxy");

    expect(
      (
        await productionProxy(
          new NextRequest("http://localhost:3000/dashboard"),
          {} as never,
        )
      )?.status,
    ).toBe(401);

    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");
    const { default: developmentProxy } = await import("@/proxy");

    expect(
      (
        await developmentProxy(
          new NextRequest("https://preview.clipstitchr.com/dashboard"),
          {} as never,
        )
      )?.status,
    ).toBe(401);
  });

  it("keeps normal Clerk protection and strips an injected bypass marker when off", async () => {
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "false");
    const { default: proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: { [developmentAuthBypassHeaderName]: "1" },
    });

    await proxy(request, {} as never);

    expect(mocks.runClerkProtectedProxy).toHaveBeenCalledOnce();
    const protectedRequest = mocks.runClerkProtectedProxy.mock.calls[0]?.[0] as
      | NextRequest
      | undefined;

    expect(protectedRequest?.headers.get(developmentAuthBypassHeaderName)).toBeNull();
  });
});
