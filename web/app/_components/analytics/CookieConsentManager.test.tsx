import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieConsentManager } from "@/app/_components/analytics/CookieConsentManager";
import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";

const mocks = vi.hoisted(() => ({
  applyCookieConsentPreferences: vi.fn(),
  bannerProps: null as {
    onAcceptAll: () => void;
    onEssentialsOnly: () => void;
  } | null,
  createCookieConsentPreferences: vi.fn(),
  dialogProps: null as {
    onAcceptAll: () => void;
    onCancel: () => void;
    onEssentialsOnly: () => void;
    onSave: (preferences: { analytics: boolean; marketing: boolean }) => void;
  } | null,
  getStoredCookieConsent: vi.fn(),
  setStoredCookieConsent: vi.fn(),
  stateQueue: [] as unknown[],
  stateSetter: vi.fn(),
  useEffect: vi.fn(),
  useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
    useState: mocks.useState,
  };
});

vi.mock("@/lib/clipstitchr/analytics/applyCookieConsentPreferences", () => ({
  applyCookieConsentPreferences: mocks.applyCookieConsentPreferences,
}));

vi.mock("@/lib/clipstitchr/analytics/createCookieConsentPreferences", () => ({
  createCookieConsentPreferences: mocks.createCookieConsentPreferences,
}));

vi.mock("@/lib/clipstitchr/analytics/getStoredCookieConsent", () => ({
  getStoredCookieConsent: mocks.getStoredCookieConsent,
}));

vi.mock("@/lib/clipstitchr/analytics/setStoredCookieConsent", () => ({
  setStoredCookieConsent: mocks.setStoredCookieConsent,
}));

vi.mock("@/app/_components/analytics/CookieConsentBanner", () => ({
  CookieConsentBanner: (props: {
    onAcceptAll: () => void;
    onEssentialsOnly: () => void;
  }) => {
    mocks.bannerProps = props;
    return "CookieConsentBanner";
  },
}));

vi.mock("@/app/_components/analytics/CookiePreferencesDialog", () => ({
  CookiePreferencesDialog: (props: {
    onAcceptAll: () => void;
    onCancel: () => void;
    onEssentialsOnly: () => void;
    onSave: (preferences: { analytics: boolean; marketing: boolean }) => void;
  }) => {
    mocks.dialogProps = props;
    return "CookiePreferencesDialog";
  },
}));

vi.mock("@/app/_components/analytics/PostHogIdentityReporter", () => ({
  PostHogIdentityReporter: () => "PostHogIdentityReporter",
}));

vi.mock("@/app/_components/analytics/PostHogPageViewTracker", () => ({
  PostHogPageViewTracker: () => "PostHogPageViewTracker",
}));

vi.mock("@/app/_components/analytics/TikTokIdentityReporter", () => ({
  TikTokIdentityReporter: () => "TikTokIdentityReporter",
}));

vi.mock("@/app/_components/analytics/TikTokPixelScript", () => ({
  TikTokPixelScript: () => "TikTokPixelScript",
}));

vi.mock("@/app/_components/analytics/TikTokViewContentTracker", () => ({
  TikTokViewContentTracker: () => "TikTokViewContentTracker",
}));

function createPreferences(
  overrides: Partial<CookieConsentPreferences> = {},
): CookieConsentPreferences {
  return {
    analytics: true,
    marketing: true,
    necessary: true,
    updatedAt: "2026-05-20T00:00:00.000Z",
    version: "2026-05-16",
    ...overrides,
  };
}

describe("CookieConsentManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bannerProps = null;
    mocks.dialogProps = null;
    mocks.stateQueue = [];
    mocks.createCookieConsentPreferences.mockImplementation((input) =>
      createPreferences(input),
    );
    mocks.useState.mockImplementation((initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.stateSetter,
    ]);
  });

  it("renders nothing before cookie consent loads", () => {
    mocks.stateQueue = [null, false, null];

    expect(renderToStaticMarkup(<CookieConsentManager />)).toBe("");
  });

  it("renders trackers when stored preferences allow analytics and marketing", () => {
    mocks.stateQueue = [createPreferences(), true, null];

    const markup = renderToStaticMarkup(<CookieConsentManager />);

    expect(markup).toContain("PostHogIdentityReporter");
    expect(markup).toContain("PostHogPageViewTracker");
    expect(markup).toContain("TikTokPixelScript");
    expect(markup).toContain("TikTokIdentityReporter");
    expect(markup).toContain("TikTokViewContentTracker");
  });

  it("saves banner and preferences dialog choices", () => {
    mocks.stateQueue = [null, true, "banner"];
    expect(renderToStaticMarkup(<CookieConsentManager />)).toContain(
      "CookieConsentBanner",
    );

    mocks.bannerProps?.onAcceptAll();
    mocks.bannerProps?.onEssentialsOnly();

    expect(mocks.setStoredCookieConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        analytics: true,
        marketing: true,
      }),
    );
    expect(mocks.setStoredCookieConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        analytics: false,
        marketing: false,
      }),
    );

    mocks.stateQueue = [createPreferences({ analytics: false }), true, "preferences"];
    expect(renderToStaticMarkup(<CookieConsentManager />)).toContain(
      "CookiePreferencesDialog",
    );

    mocks.dialogProps?.onSave({ analytics: true, marketing: false });
    mocks.dialogProps?.onCancel();

    expect(mocks.setStoredCookieConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        analytics: true,
        marketing: false,
      }),
    );
    expect(mocks.stateSetter).toHaveBeenCalledWith(null);
  });
});
