import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("development RootProviders", () => {
  afterEach(() => {
    vi.doUnmock("@/app/AuthenticatedRootProviders");
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("renders without loading Clerk or Convex when the bypass is active", async () => {
    vi.doMock("@/app/AuthenticatedRootProviders", () => ({
      AuthenticatedRootProviders: () => {
        throw new Error("Authenticated providers must not initialize");
      },
    }));

    const { RootProviders } = await import("@/app/RootProviders");
    const tree = await RootProviders({
      children: <main>Local dashboard</main>,
      isDevelopmentAuthBypass: true,
    });

    expect(renderToStaticMarkup(tree)).toContain("Local dashboard");
  });

  it("keeps the normal authenticated provider path when bypass is off", async () => {
    vi.doMock("@/app/AuthenticatedRootProviders", () => ({
      AuthenticatedRootProviders: ({
        children,
      }: {
        children: React.ReactNode;
      }) => <div data-provider="clerk-and-convex">{children}</div>,
    }));

    const { RootProviders } = await import("@/app/RootProviders");
    const tree = await RootProviders({
      children: <main>Protected dashboard</main>,
      isDevelopmentAuthBypass: false,
    });
    const markup = renderToStaticMarkup(tree);

    expect(markup).toContain('data-provider="clerk-and-convex"');
    expect(markup).toContain("Protected dashboard");
  });
});
