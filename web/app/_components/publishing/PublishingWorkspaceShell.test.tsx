import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishingWorkspaceShell } from "@/app/_components/publishing/PublishingWorkspaceShell";

const navigation = vi.hoisted(() => ({
  pathname: "/dashboard/studio/publishing/calendar",
}));
const product = vi.hoisted(() => ({
  value: {
    activeProduct: { id: "product_1", name: "Garden Camera" } as {
      id: string;
      name: string;
    } | null,
    activeProductId: "product_1" as string | null,
    isLoading: false,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => product.value,
}));

describe("PublishingWorkspaceShell", () => {
  beforeEach(() => {
    navigation.pathname = "/dashboard/studio/publishing/calendar";
    product.value = {
      activeProduct: { id: "product_1", name: "Garden Camera" },
      activeProductId: "product_1",
      isLoading: false,
    };
  });

  it("mounts the Studio publishing shell with its task routes", () => {
    const markup = renderToStaticMarkup(
      <PublishingWorkspaceShell>
        <h1>Publishing calendar</h1>
      </PublishingWorkspaceShell>,
    );

    expect(markup).toContain('aria-label="Publishing workspace"');
    expect(markup).toContain('aria-label="Studio workspace"');
    expect(markup).toContain('aria-label="Postiz Beta workspace"');
    expect(markup).toContain('href="/dashboard/studio/publishing/compose"');
    expect(markup).toContain('href="/dashboard/studio/publishing/calendar"');
    expect(markup).toContain('href="/dashboard/studio/publishing/posts"');
    expect(markup).toContain('href="/dashboard/studio/publishing/analytics"');
    expect(markup).toContain('href="/dashboard/studio/publishing/connections"');
    expect(markup).toContain("Publishing calendar");
    expect(markup).toContain("Postiz Beta");
    expect(markup).toContain("Publishing for");
    expect(markup).toContain("Garden Camera");
    expect(markup).toContain('<span aria-current="page"');
    expect(markup).toContain("Publish</span>");
    expect(markup).not.toContain("<main");
  });

  it("marks the current publishing task without adding a decorative dot", () => {
    navigation.pathname = "/dashboard/studio/publishing/analytics";

    const markup = renderToStaticMarkup(
      <PublishingWorkspaceShell>
        <p>Account results</p>
      </PublishingWorkspaceShell>,
    );

    const analyticsLink = markup.match(
      /<a[^>]+href="\/dashboard\/studio\/publishing\/analytics"[^>]*>/,
    )?.[0];

    expect(analyticsLink).toContain('aria-current="page"');
    expect(markup).not.toContain("active-dot");
  });

  it("does not mount Product work until the dashboard has an active Product", () => {
    product.value = {
      activeProduct: null,
      activeProductId: null,
      isLoading: false,
    };

    const markup = renderToStaticMarkup(
      <PublishingWorkspaceShell>
        <p>Private Product publishing work</p>
      </PublishingWorkspaceShell>,
    );

    expect(markup).toContain("Choose a Product first");
    expect(markup).not.toContain("Private Product publishing work");
  });
});
