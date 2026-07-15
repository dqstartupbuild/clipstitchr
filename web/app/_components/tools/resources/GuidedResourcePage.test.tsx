import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { appDemoRecordingChecklistDefinition } from "@/lib/clipstitchr/tools/appDemoRecordingChecklist/appDemoRecordingChecklistDefinition";
import { appUgcAdBriefTemplateDefinition } from "@/lib/clipstitchr/tools/appUgcAdBriefTemplate/appUgcAdBriefTemplateDefinition";
import { fiveDayContentSprintDefinition } from "@/lib/clipstitchr/tools/fiveDayContentSprint/fiveDayContentSprintDefinition";

const mocks = vi.hoisted(() => ({
  isBrowserUnlocked: false,
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock",
  () => ({
    usePublicToolBrowserUnlock: () => mocks.isBrowserUnlocked,
  }),
);

describe("GuidedResourcePage gate presentation", () => {
  beforeEach(() => {
    mocks.isBrowserUnlocked = false;
  });

  it("keeps the complete guided brief public while gating its Markdown artifact", () => {
    const lastSection = appUgcAdBriefTemplateDefinition.sections.at(-1)!;
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={appUgcAdBriefTemplateDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain(lastSection.title);
    expect(markup).not.toContain("Copy my resource");
    expect(markup).not.toContain("Download Markdown");
    expect(markup).toContain("Unlock the Markdown brief");
  });

  it("restores the Markdown artifact after the shared browser unlock", () => {
    mocks.isBrowserUnlocked = true;
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={appUgcAdBriefTemplateDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("Copy my resource");
    expect(markup).toContain("Download Markdown");
    expect(markup).not.toContain(
      'id="app-ugc-ad-brief-template-lead-heading"',
    );
  });

  it("gates the approved print artifact while leaving the checklist usable", () => {
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={appDemoRecordingChecklistDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("Choose one capture method");
    expect(markup).not.toContain("Download Markdown");
    expect(markup).not.toContain("Print checklist");
    expect(markup).toContain("Unlock the print-ready checklist");
  });

  it("provides the exact print action after browser unlock", () => {
    mocks.isBrowserUnlocked = true;
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={appDemoRecordingChecklistDefinition}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("Print checklist");
    expect(markup).not.toContain("Download Markdown");
  });

  it("keeps course lessons private while the provider is unavailable", () => {
    const firstSection = fiveDayContentSprintDefinition.sections[0]!;
    const lastSection = fiveDayContentSprintDefinition.sections.at(-1)!;
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={fiveDayContentSprintDefinition}
        isEmailProviderReady={false}
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain(lastSection.title);
    expect(markup).not.toContain(firstSection.items[0]!.body);
    expect(markup).not.toContain("Download Markdown");
    expect(markup).toContain(
      'id="five-day-app-content-sprint-lead-heading"',
    );
    expect(markup).not.toContain("Start my five-day sprint");
  });

  it("keeps course lessons private outside the email rollout", () => {
    const firstSection = fiveDayContentSprintDefinition.sections[0]!;
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={fiveDayContentSprintDefinition}
        isEmailProviderReady={false}
        variant="control"
      />,
    );

    expect(markup).toContain(firstSection.title);
    expect(markup).not.toContain(firstSection.items[0]!.body);
    expect(markup).not.toContain("Download Markdown");
  });

  it("shows locked lesson titles and the native enrollment when ready", () => {
    const firstSection = fiveDayContentSprintDefinition.sections[0];
    const lastSection = fiveDayContentSprintDefinition.sections.at(-1)!;
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={fiveDayContentSprintDefinition}
        isEmailProviderReady
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain(firstSection.title);
    expect(markup).toContain(lastSection.title);
    expect(markup).not.toContain(firstSection.items[0]!.body);
    expect(markup).not.toContain(lastSection.items[0]!.body);
    expect(markup).not.toContain("Download Markdown");
    expect(markup).toContain("Start my five-day sprint");
    expect(markup).not.toMatch(/sent|delivered|check your inbox/i);
  });

  it("does not unlock a course from the portfolio-wide browser marker", () => {
    mocks.isBrowserUnlocked = true;
    const firstSection = fiveDayContentSprintDefinition.sections[0]!;
    const lastSection = fiveDayContentSprintDefinition.sections.at(-1)!;
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={fiveDayContentSprintDefinition}
        isEmailProviderReady
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain(lastSection.title);
    expect(markup).not.toContain(firstSection.items[0]!.body);
    expect(markup).not.toContain(lastSection.items[0]!.body);
    expect(markup).not.toContain("Download Markdown");
    expect(markup).toContain("Start my five-day sprint");
  });

  it("offers one-click enrollment only with a verified course session", () => {
    const sessionMarkup = renderToStaticMarkup(
      <GuidedResourcePage
        courseWorkspaceState={{
          availableSectionCount: 0,
          hasAccess: false,
          hasSession: true,
          progressItems: [],
        }}
        definition={fiveDayContentSprintDefinition}
        isEmailProviderReady
        variant="hybrid-v1"
      />,
    );
    const unrecognizedMarkup = renderToStaticMarkup(
      <GuidedResourcePage
        definition={fiveDayContentSprintDefinition}
        isEmailProviderReady
        variant="hybrid-v1"
      />,
    );

    expect(sessionMarkup).toContain("Open this course with one click.");
    expect(sessionMarkup).toContain("Start my five-day sprint");
    expect(unrecognizedMarkup).not.toContain("Open this course with one click.");
    expect(unrecognizedMarkup).toContain("Start my five-day sprint");
  });

  it("shows only released sections from the app-owned entitlement", () => {
    const secondSection = fiveDayContentSprintDefinition.sections[1]!;
    const thirdSection = fiveDayContentSprintDefinition.sections[2]!;
    const markup = renderToStaticMarkup(
      <GuidedResourcePage
        courseWorkspaceState={{
          activatedAt: 1_000,
          availableSectionCount: 2,
          hasAccess: true,
          hasSession: true,
          progressItems: [],
        }}
        definition={fiveDayContentSprintDefinition}
        isEmailProviderReady
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain(secondSection.items[0]!.body);
    expect(markup).toContain(thirdSection.title);
    expect(markup).not.toContain(thirdSection.items[0]!.body);
    expect(markup).toContain("Download Markdown");
    expect(markup).not.toContain("Start my five-day sprint");
  });
});
