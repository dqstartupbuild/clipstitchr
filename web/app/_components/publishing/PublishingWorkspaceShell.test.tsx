import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishingWorkspaceShell } from "@/app/_components/publishing/PublishingWorkspaceShell";

const navigation = vi.hoisted(() => ({
  pathname: "/dashboard/publishing/calendar",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

describe("PublishingWorkspaceShell", () => {
  beforeEach(() => {
    navigation.pathname = "/dashboard/publishing/calendar";
  });

  it("mounts the retained publishing shell with its four task routes", () => {
    const markup = renderToStaticMarkup(
      <PublishingWorkspaceShell>
        <h1>Publishing calendar</h1>
      </PublishingWorkspaceShell>,
    );

    expect(markup).toContain('aria-label="Publishing workspace"');
    expect(markup).toContain('aria-label="Publishing"');
    expect(markup).toContain('href="/dashboard/publishing/calendar"');
    expect(markup).toContain('href="/dashboard/publishing/posts"');
    expect(markup).toContain('href="/dashboard/publishing/analytics"');
    expect(markup).toContain('href="/dashboard/publishing/integrations"');
    expect(markup).toContain("Publishing calendar");
    expect(markup).not.toContain("Postiz");
  });

  it("marks the current publishing task without adding a decorative dot", () => {
    navigation.pathname = "/dashboard/publishing/analytics";

    const markup = renderToStaticMarkup(
      <PublishingWorkspaceShell>
        <p>Account results</p>
      </PublishingWorkspaceShell>,
    );

    const analyticsLink = markup.match(
      /<a[^>]+href="\/dashboard\/publishing\/analytics"[^>]*>/,
    )?.[0];

    expect(analyticsLink).toContain("bg-[var(--surface-muted)]");
    expect(markup).not.toContain("active-dot");
  });
});
