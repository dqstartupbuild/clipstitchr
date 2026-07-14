import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CollectionResourcePage } from "@/app/_components/tools/resources/CollectionResourcePage";
import { adTeardownLibraryDefinition } from "@/lib/clipstitchr/tools/adTeardownLibrary/adTeardownLibraryDefinition";
import { appDemoVideoHooksDefinition } from "@/lib/clipstitchr/tools/appDemoVideoHooks/appDemoVideoHooksDefinition";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import { ugcOpeningLinePromptsDefinition } from "@/lib/clipstitchr/tools/ugcOpeningLinePrompts/ugcOpeningLinePromptsDefinition";

const mocks = vi.hoisted(() => ({
  isBrowserUnlocked: false,
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock",
  () => ({
    usePublicToolBrowserUnlock: () => mocks.isBrowserUnlocked,
  }),
);

describe("CollectionResourcePage gate presentation", () => {
  beforeEach(() => {
    mocks.isBrowserUnlocked = false;
  });

  it("keeps individual teardowns public while gating the matching Markdown library", () => {
    const markup = renderToStaticMarkup(
      <CollectionResourcePage
        definition={adTeardownLibraryDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("The weekly reset");
    expect(markup).toContain("Copy this");
    expect(markup).not.toContain("Copy full collection");
    expect(markup).not.toContain("Download collection");
    expect(markup).toContain(
      getPublicToolGateMetadata("app-ad-teardown-library").outcomeCta,
    );
  });

  it("restores the portable library after the shared browser unlock", () => {
    mocks.isBrowserUnlocked = true;
    const markup = renderToStaticMarkup(
      <CollectionResourcePage
        definition={adTeardownLibraryDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("Copy full collection");
    expect(markup).toContain("Download collection");
    expect(markup).not.toContain(
      'id="app-ad-teardown-library-lead-heading"',
    );
  });

  it("gates the approved CSV artifact while leaving the collection browsable", () => {
    const markup = renderToStaticMarkup(
      <CollectionResourcePage
        definition={appDemoVideoHooksDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("The repeat task");
    expect(markup).not.toContain("Copy full collection");
    expect(markup).not.toContain("Download CSV");
    expect(markup).toContain("Unlock the CSV hook library");
  });

  it("provides the exact CSV artifact after browser unlock", () => {
    mocks.isBrowserUnlocked = true;
    const markup = renderToStaticMarkup(
      <CollectionResourcePage
        definition={appDemoVideoHooksDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("Download CSV");
    expect(markup).not.toContain("Download collection");
    expect(markup).not.toContain("Copy full collection");
  });

  it("provides the exact print action for prompt cards", () => {
    mocks.isBrowserUnlocked = true;
    const markup = renderToStaticMarkup(
      <CollectionResourcePage
        definition={ugcOpeningLinePromptsDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("Print collection");
    expect(markup).not.toContain("Download collection");
  });
});
