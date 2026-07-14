import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

const mocks = vi.hoisted(() => ({
  isBrowserUnlocked: false,
  usePublicToolGateAnalytics: vi.fn(),
  toolLeadCaptureForm: vi.fn(
    (props: {
      outcomeCta?: string;
      source: string;
      unlockOutcome?: string;
    }) => (
      <section>
        {props.source}|{props.outcomeCta}|{props.unlockOutcome}
      </section>
    ),
  ),
}));

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: mocks.toolLeadCaptureForm,
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock",
  () => ({
    usePublicToolBrowserUnlock: () => mocks.isBrowserUnlocked,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/usePublicToolGateAnalytics",
  () => ({
    usePublicToolGateAnalytics: mocks.usePublicToolGateAnalytics,
  }),
);

describe("PublicToolGateCapture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isBrowserUnlocked = false;
  });

  it.each(
    publicToolKeys.filter(
      (key) => getPublicToolGateMetadata(key).mode !== "email-native",
    ),
  )("uses catalog outcome copy for %s", (toolKey) => {
    const metadata = getPublicToolGateMetadata(toolKey);
    renderToStaticMarkup(
      <PublicToolGateCapture
        hasFunctionalUnlock
        toolKey={toolKey}
        variant="hybrid-v1"
      />,
    );

    expect(mocks.toolLeadCaptureForm).toHaveBeenLastCalledWith(
      expect.objectContaining({
        outcomeCta: metadata.outcomeCta,
        unlockOutcome: metadata.value.unlockedValue,
      }),
      undefined,
    );
  });

  it("hides a browser-local gate after one accepted capture", () => {
    mocks.isBrowserUnlocked = true;

    expect(
      renderToStaticMarkup(
        <PublicToolGateCapture
          hasFunctionalUnlock
          toolKey="app-hook-generator"
          variant="hybrid-v1"
        />,
      ),
    ).toBe("");
  });

  it("fully suppresses lifecycle tracking for a nested capture", () => {
    renderToStaticMarkup(
      <PublicToolGateCapture
        hasFunctionalUnlock
        toolKey="app-hook-generator"
        trackLifecycle={false}
        variant="hybrid-v1"
      />,
    );

    expect(mocks.usePublicToolGateAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ isEnabled: false }),
    );
  });

  it("uses a truthful portfolio unlock when a tool companion is unavailable", () => {
    renderToStaticMarkup(
      <PublicToolGateCapture
        hasFunctionalUnlock={false}
        toolKey="ad-variant-calculator"
        variant="hybrid-v1"
      />,
    );

    expect(mocks.toolLeadCaptureForm).toHaveBeenLastCalledWith(
      expect.objectContaining({
        gateMode: "open-result",
        outcomeCta: "Unlock browser extras",
        source: "ad-variant-calculator",
        unlockOutcome:
          "browser extras across ClipStitchr's free public tools",
        variant: "hybrid-v1",
      }),
      undefined,
    );
  });

  it("hides a portfolio unlock after the shared browser marker exists", () => {
    mocks.isBrowserUnlocked = true;

    expect(
      renderToStaticMarkup(
        <PublicToolGateCapture
          hasFunctionalUnlock={false}
          toolKey="ad-variant-calculator"
          variant="hybrid-v1"
        />,
      ),
    ).toBe("");
  });

  it.each([
    "five-day-app-content-sprint",
    "ugc-to-app-ad-mini-course",
    "app-creative-testing-system-workshop",
  ] as const)("keeps %s in control while its email provider is unavailable", (toolKey) => {
    renderToStaticMarkup(
      <PublicToolGateCapture
        hasFunctionalUnlock
        isEmailProviderReady={false}
        toolKey={toolKey}
        variant="hybrid-v1"
      />,
    );

    expect(mocks.toolLeadCaptureForm).toHaveBeenLastCalledWith(
      { source: toolKey },
      undefined,
    );
  });

  it.each([
    "five-day-app-content-sprint",
    "ugc-to-app-ad-mini-course",
    "app-creative-testing-system-workshop",
  ] as const)("activates the catalog enrollment for ready %s", (toolKey) => {
    const metadata = getPublicToolGateMetadata(toolKey);

    renderToStaticMarkup(
      <PublicToolGateCapture
        hasFunctionalUnlock
        isEmailProviderReady
        toolKey={toolKey}
        variant="hybrid-v1"
      />,
    );

    expect(mocks.toolLeadCaptureForm).toHaveBeenLastCalledWith(
      expect.objectContaining({
        gateMode: "email-native",
        isEmailProviderReady: true,
        outcomeCta: metadata.outcomeCta,
        source: toolKey,
        unlockOutcome: metadata.value.unlockedValue,
        variant: "hybrid-v1",
      }),
      undefined,
    );
  });

  it.each([
    "five-day-app-content-sprint",
    "ugc-to-app-ad-mini-course",
    "app-creative-testing-system-workshop",
  ] as const)("keeps the explicit %s enrollment after a browser unlock", (toolKey) => {
    mocks.isBrowserUnlocked = true;

    renderToStaticMarkup(
      <PublicToolGateCapture
        hasFunctionalUnlock
        isEmailProviderReady
        toolKey={toolKey}
        variant="hybrid-v1"
      />,
    );

    expect(mocks.toolLeadCaptureForm).toHaveBeenCalledWith(
      expect.objectContaining({
        gateMode: "email-native",
        source: toolKey,
      }),
      undefined,
    );
  });
});
