import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieConsentIdentityReporters } from "@/app/_components/analytics/CookieConsentIdentityReporters";
import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { cookieConsentUpdatedEventName } from "@/lib/clipstitchr/analytics/cookieConsentUpdatedEventName";

const mocks = vi.hoisted(() => ({
  getStoredCookieConsent: vi.fn(),
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

vi.mock("@/lib/clipstitchr/analytics/getStoredCookieConsent", () => ({
  getStoredCookieConsent: mocks.getStoredCookieConsent,
}));

vi.mock("@/app/_components/analytics/PostHogIdentityReporter", () => ({
  PostHogIdentityReporter: () => "PostHogIdentityReporter",
}));

vi.mock("@/app/_components/analytics/TikTokIdentityReporter", () => ({
  TikTokIdentityReporter: () => "TikTokIdentityReporter",
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

describe("CookieConsentIdentityReporters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.stateQueue = [];
    mocks.useState.mockImplementation((initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.stateSetter,
    ]);
  });

  it("renders identity reporters only when stored consent allows them", () => {
    mocks.stateQueue = [createPreferences()];

    const markup = renderToStaticMarkup(<CookieConsentIdentityReporters />);

    expect(markup).toContain("PostHogIdentityReporter");
    expect(markup).toContain("TikTokIdentityReporter");
  });

  it("syncs stored preferences and cleans up the consent listener", () => {
    const cleanupFns: Array<() => void> = [];
    const storedPreferences = createPreferences({ marketing: false });
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    mocks.getStoredCookieConsent.mockReturnValue(storedPreferences);
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      const cleanup = effect();

      if (typeof cleanup === "function") {
        cleanupFns.push(cleanup);
      }
    });
    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener,
    });

    renderToStaticMarkup(<CookieConsentIdentityReporters />);

    expect(mocks.stateSetter).toHaveBeenCalledWith(storedPreferences);
    expect(addEventListener).toHaveBeenCalledWith(
      cookieConsentUpdatedEventName,
      expect.any(Function),
    );

    cleanupFns[0]();

    expect(removeEventListener).toHaveBeenCalledWith(
      cookieConsentUpdatedEventName,
      expect.any(Function),
    );

    vi.unstubAllGlobals();
  });
});
