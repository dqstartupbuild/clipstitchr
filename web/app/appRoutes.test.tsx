import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SignInPage from "@/app/(auth)/sign-in/[[...sign-in]]/page";
import SignUpPage from "@/app/(auth)/sign-up/[[...sign-up]]/page";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import DashboardPage from "@/app/dashboard/page";
import DashboardLayout from "@/app/dashboard/layout";
import AvatarsPage from "@/app/dashboard/avatars/page";
import CliprPage from "@/app/dashboard/clipr/page";
import HookLabPage from "@/app/dashboard/hooks/page";
import LibraryPage from "@/app/dashboard/library/page";
import OnboardingPage from "@/app/dashboard/onboarding/page";
import SettingsPage from "@/app/dashboard/settings/page";
import StitchesPage from "@/app/dashboard/stitches/page";
import StitchrPage from "@/app/dashboard/stitchr/page";
import SwaprPage from "@/app/dashboard/swapr/page";
import SwiprPage from "@/app/dashboard/swipr/page";
import TemplatesPage from "@/app/dashboard/templates/page";
import UploadsPage from "@/app/dashboard/uploads/page";
import robots from "@/app/robots";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
    height,
    src,
    width,
  }: {
    alt: string;
    className?: string;
    height?: number;
    src: string;
    width?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      height={height}
      src={src}
      width={width}
    />
  ),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@clerk/nextjs", () => ({
  SignIn: () => <div>Clerk sign in</div>,
}));

vi.mock("@/app/_components/auth/WaitlistForm", () => ({
  WaitlistForm: () => <form>Waitlist form</form>,
}));

vi.mock("@/app/dashboard/DashboardPageClient", () => ({
  DashboardPageClient: () => <main>Dashboard client</main>,
}));

vi.mock("@/app/dashboard/DashboardProductProvider", () => ({
  DashboardProductProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/app/dashboard/DashboardLibraryProvider", () => ({
  DashboardLibraryProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/app/dashboard/clipr/CliprPageClient", () => ({
  CliprPageClient: () => <main>Clipr client</main>,
}));

vi.mock("@/app/dashboard/hooks/HookLabPageClient", () => ({
  HookLabPageClient: () => <main>Hook Lab client</main>,
}));

vi.mock("@/app/dashboard/library/LibraryPageClient", () => ({
  LibraryPageClient: () => <main>Library client</main>,
}));

vi.mock("@/app/dashboard/onboarding/OnboardingPageClient", () => ({
  OnboardingPageClient: () => <main>Onboarding client</main>,
}));

vi.mock("@/app/dashboard/settings/SettingsPageClient", () => ({
  SettingsPageClient: () => <main>Settings client</main>,
}));

vi.mock("@/app/dashboard/stitchr/StitchrPageClient", () => ({
  StitchrPageClient: () => <main>Stitchr client</main>,
}));

vi.mock("@/app/dashboard/swapr/SwaprPageClient", () => ({
  SwaprPageClient: () => <main>Swapr client</main>,
}));

vi.mock("@/app/dashboard/swipr/SwiprPageClient", () => ({
  SwiprPageClient: () => <main>Swipr client</main>,
}));

vi.mock("@/lib/clipstitchr/hooks/useClipLibraryState", () => ({
  useClipLibraryState: () => ({ clips: [] }),
}));

vi.mock("@/lib/clipstitchr/hooks/usePhotoLibraryState", () => ({
  usePhotoLibraryState: () => ({ photos: [] }),
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibraryState", () => ({
  useSwiprLibraryState: () => ({ swipes: [] }),
}));

describe("app route wrappers", () => {
  it("renders auth route shells", () => {
    const markup = renderToStaticMarkup(
      <>
        <SignInPage />
        <SignUpPage />
      </>,
    );

    expect(markup).toContain(
      "Back to the place where your clips actually turn into ads.",
    );
    expect(markup).toContain("Clerk sign in");
    expect(markup).toContain(
      "Built by someone who hates making content. Access is still invite-only.",
    );
    expect(markup).toContain("Waitlist form");
    expect(markup).toContain("Inside ClipStitchr");
  });

  it("renders dashboard page wrapper clients and provider layout", () => {
    const markup = renderToStaticMarkup(
      <DashboardLayout>
        <DashboardPage />
        <CliprPage />
        <HookLabPage />
        <LibraryPage />
        <OnboardingPage />
        <SettingsPage />
        <StitchrPage />
        <SwaprPage />
        <SwiprPage />
      </DashboardLayout>,
    );

    expect(markup).toContain("Dashboard client");
    expect(markup).toContain("Clipr client");
    expect(markup).toContain("Hook Lab client");
    expect(markup).toContain("Library client");
    expect(markup).toContain("Onboarding client");
    expect(markup).toContain("Settings client");
    expect(markup).toContain("Stitchr client");
    expect(markup).toContain("Swapr client");
    expect(markup).toContain("Swipr client");
  });

  it("redirects old dashboard library routes", () => {
    expect(() => AvatarsPage()).toThrow(
      "REDIRECT:/dashboard/library?tab=avatars",
    );
    expect(() => TemplatesPage()).toThrow(
      "REDIRECT:/dashboard/library?tab=templates",
    );
    expect(() => UploadsPage()).toThrow("REDIRECT:/dashboard/library");
    expect(() => StitchesPage()).toThrow(
      "REDIRECT:/dashboard/library?tab=stitches",
    );
  });

  it("returns robots metadata and renders shared button links", () => {
    const robotsMetadata = robots();
    const markup = renderToStaticMarkup(
      <>
        <PrimaryButtonLink href="/dashboard">Primary CTA</PrimaryButtonLink>
        <SecondaryButtonLink href="/docs">Secondary CTA</SecondaryButtonLink>
      </>,
    );

    expect(robotsMetadata.host).toBe("http://localhost:3000");
    expect(robotsMetadata.sitemap).toEqual(
      expect.arrayContaining([
        "http://localhost:3000/sitemap.xml",
        "http://localhost:3000/video-sitemap.xml",
      ]),
    );
    expect(robotsMetadata.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          disallow: expect.arrayContaining(["/api/", "/dashboard"]),
        }),
      ]),
    );
    expect(markup).toContain("Primary CTA");
    expect(markup).toContain("Secondary CTA");
  });
});
