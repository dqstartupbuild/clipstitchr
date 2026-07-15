import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TestingSystemWorkshopRoutePage from "@/app/(content)/tools/app-creative-testing-system-workshop/page";
import FiveDayContentSprintRoutePage from "@/app/(content)/tools/five-day-app-content-sprint/page";
import UgcMiniCourseRoutePage from "@/app/(content)/tools/ugc-to-app-ad-mini-course/page";

const mocks = vi.hoisted(() => ({
  emailNativeReady: false,
  courseWorkspaceState: {
    availableSectionCount: 0,
    hasAccess: false,
    hasSession: true,
    progressItems: [],
  },
  resolvePublicToolGateVariantForRequest: vi.fn(async () => "control"),
}));

vi.mock(
  "@/lib/clipstitchr/tools/courses/server/getCourseWorkspaceStateForRequest",
  () => ({
    getCourseWorkspaceStateForRequest: vi.fn(
      async () => mocks.courseWorkspaceState,
    ),
  }),
);

vi.mock("@/lib/clipstitchr/email/loops/getLoopsReadiness", () => ({
  getLoopsReadiness: () => ({ emailNativeReady: mocks.emailNativeReady }),
}));

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest:
      mocks.resolvePublicToolGateVariantForRequest,
  }),
);

vi.mock("@/app/_components/tools/resources/GuidedResourcePage", () => ({
  GuidedResourcePage: ({
    definition,
    courseWorkspaceState,
    isEmailProviderReady,
    variant,
  }: {
    definition: { resourceKey: string };
    courseWorkspaceState?: { hasSession: boolean };
    isEmailProviderReady: boolean;
    variant: string;
  }) => (
    <p>
      {definition.resourceKey}|{String(isEmailProviderReady)}|{variant}|
      {String(courseWorkspaceState?.hasSession ?? false)}
    </p>
  ),
}));

const routes = [
  ["five-day-app-content-sprint", FiveDayContentSprintRoutePage],
  ["ugc-to-app-ad-mini-course", UgcMiniCourseRoutePage],
  [
    "app-creative-testing-system-workshop",
    TestingSystemWorkshopRoutePage,
  ],
] as const;

describe("email-native resource routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.emailNativeReady = false;
    mocks.resolvePublicToolGateVariantForRequest.mockResolvedValue("control");
  });

  it.each(routes)("keeps %s delivery in control while retaining course sessions", async (
    toolKey,
    renderPage,
  ) => {
    const markup = renderToStaticMarkup(await renderPage());

    expect(
      mocks.resolvePublicToolGateVariantForRequest,
    ).toHaveBeenCalledWith(toolKey, false);
    expect(markup).toContain(`${toolKey}|false|control|true`);
  });

  it.each(routes)("activates ready rollout selection for %s", async (
    toolKey,
    renderPage,
  ) => {
    mocks.emailNativeReady = true;
    mocks.resolvePublicToolGateVariantForRequest.mockResolvedValue(
      "hybrid-v1",
    );

    const markup = renderToStaticMarkup(await renderPage());

    expect(
      mocks.resolvePublicToolGateVariantForRequest,
    ).toHaveBeenCalledWith(toolKey, true);
    expect(markup).toContain(`${toolKey}|true|hybrid-v1|true`);
  });
});
