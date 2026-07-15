import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicToolGateContentBoundary } from "@/app/_components/tools/gates/PublicToolGateContentBoundary";

const mocks = vi.hoisted(() => ({
  isBrowserUnlocked: false,
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock",
  () => ({
    usePublicToolBrowserUnlock: () => mocks.isBrowserUnlocked,
  }),
);

vi.mock("@/app/_components/tools/gates/PublicToolGateCapture", () => ({
  PublicToolGateCapture: ({ toolKey }: { toolKey: string }) => (
    <aside>Capture for {toolKey}</aside>
  ),
}));

function renderBoundary({
  emailNativeEnrollmentControl,
  isEmailNativeEnrolled = false,
  isEmailProviderReady = false,
  toolKey,
  variant = "hybrid-v1" as const,
}: {
  emailNativeEnrollmentControl?: React.ReactNode;
  isEmailNativeEnrolled?: boolean;
  isEmailProviderReady?: boolean;
  toolKey:
    | "what-should-i-post-decision-tree"
    | "app-hook-generator"
    | "100-app-demo-video-hooks"
    | "five-day-app-content-sprint";
  variant?: "control" | "hybrid-v1";
}) {
  return renderToStaticMarkup(
    <PublicToolGateContentBoundary
      emailNativeEnrollmentControl={emailNativeEnrollmentControl}
      hasFunctionalUnlock
      isEmailNativeEnrolled={isEmailNativeEnrolled}
      isEmailProviderReady={isEmailProviderReady}
      publicContent={<p>Public value</p>}
      toolKey={toolKey}
      unlockedContent={<p>Unlocked value</p>}
      variant={variant}
    />,
  );
}

describe("PublicToolGateContentBoundary", () => {
  beforeEach(() => {
    mocks.isBrowserUnlocked = false;
  });

  it.each([
    "what-should-i-post-decision-tree",
    "app-hook-generator",
    "100-app-demo-video-hooks",
  ] as const)("shows public value and locks deeper %s value", (toolKey) => {
    const markup = renderBoundary({ toolKey });

    expect(markup).toContain("Public value");
    expect(markup).not.toContain("Unlocked value");
    expect(markup).toContain(`Capture for ${toolKey}`);
  });

  it.each([
    "what-should-i-post-decision-tree",
    "app-hook-generator",
    "100-app-demo-video-hooks",
  ] as const)("shows unlocked %s value after the shared browser unlock", (toolKey) => {
    mocks.isBrowserUnlocked = true;
    const markup = renderBoundary({ toolKey });

    expect(markup).toContain("Public value");
    expect(markup).toContain("Unlocked value");
    expect(markup).not.toContain("Capture for");
  });

  it("preserves complete control behavior", () => {
    const markup = renderBoundary({
      toolKey: "app-hook-generator",
      variant: "control",
    });

    expect(markup).toContain("Public value");
    expect(markup).toContain("Unlocked value");
    expect(markup).not.toContain("Capture for");
  });

  it("keeps email-native content in control when provider readiness is false", () => {
    const markup = renderBoundary({
      emailNativeEnrollmentControl: <p>Enroll now</p>,
      isEmailProviderReady: false,
      toolKey: "five-day-app-content-sprint",
    });

    expect(markup).toContain("Public value");
    expect(markup).toContain("Unlocked value");
    expect(markup).not.toContain("Enroll now");
  });

  it("requires a functional enrollment control before gating email-native content", () => {
    const markup = renderBoundary({
      isEmailProviderReady: true,
      toolKey: "five-day-app-content-sprint",
    });

    expect(markup).toContain("Public value");
    expect(markup).toContain("Unlocked value");
  });

  it("requires course enrollment even after a portfolio browser unlock", () => {
    mocks.isBrowserUnlocked = true;
    const unlockedMarkup = renderBoundary({
      emailNativeEnrollmentControl: <p>Enroll now</p>,
      isEmailProviderReady: true,
      toolKey: "five-day-app-content-sprint",
    });
    const enrolledMarkup = renderBoundary({
      emailNativeEnrollmentControl: <p>Enroll now</p>,
      isEmailNativeEnrolled: true,
      isEmailProviderReady: true,
      toolKey: "five-day-app-content-sprint",
    });

    expect(unlockedMarkup).toContain("Public value");
    expect(unlockedMarkup).not.toContain("Unlocked value");
    expect(unlockedMarkup).toContain("Enroll now");
    expect(enrolledMarkup).toContain("Unlocked value");
    expect(enrolledMarkup).not.toContain("Enroll now");
  });
});
