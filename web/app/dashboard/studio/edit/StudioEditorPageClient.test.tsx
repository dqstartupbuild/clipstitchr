import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioEditorPageClient } from "./StudioEditorPageClient";

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  replace: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: () =>
    ({ projectId }: { projectId: string }) => (
      <div data-testid="project-loader">Project {projectId}</div>
    ),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.params,
}));
vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => ({
    activeProduct: { id: "product_1", name: "Garden camera" },
    activeProductId: "product_1",
  }),
}));
vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/app/_components/studio/editor/StudioEditorHeader", () => ({
  StudioEditorHeader: () => <header>Editor header</header>,
}));
vi.mock("@/app/_components/studio/editor/StudioEditorProjectLibrary", () => ({
  StudioEditorProjectLibrary: () => <section>Project shelf</section>,
}));
vi.mock("@/app/_components/studio/editor/StudioEditorSourceHandoff", () => ({
  StudioEditorSourceHandoff: ({ sourceId }: { sourceId: string }) => (
    <section>Source {sourceId}</section>
  ),
}));
vi.mock("@/app/_components/studio/editor/StudioEditorBriefHandoff", () => ({
  StudioEditorBriefHandoff: ({ briefId }: { briefId: string }) => (
    <section>Brief {briefId}</section>
  ),
}));

describe("StudioEditorPageClient", () => {
  beforeEach(() => {
    mocks.params = new URLSearchParams();
    mocks.replace.mockClear();
  });

  it("opens an existing Product editor project from a Stitch handoff", () => {
    mocks.params = new URLSearchParams("projectId=editor_1");

    const markup = renderToStaticMarkup(<StudioEditorPageClient />);

    expect(markup).toContain("Project editor_1");
    expect(markup).not.toContain("Project shelf");
  });

  it("routes a Research brief to the readable source-choice handoff", () => {
    mocks.params = new URLSearchParams("briefId=brief_1");

    const markup = renderToStaticMarkup(<StudioEditorPageClient />);

    expect(markup).toContain("Brief brief_1");
    expect(markup).not.toContain("Project shelf");
  });

  it("rejects URL-shaped source identifiers at the route boundary", () => {
    mocks.params = new URLSearchParams(
      "sourceId=https%3A%2F%2Fexample.com%2Fforeign",
    );

    const markup = renderToStaticMarkup(<StudioEditorPageClient />);

    expect(markup).toContain("Project shelf");
    expect(markup).not.toContain("Source https");
  });
});
