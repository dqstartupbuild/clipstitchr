import React from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardHeader } from "@/app/_components/dashboard/DashboardHeader";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { DashboardSidebar } from "@/app/_components/dashboard/DashboardSidebar";
import { DashboardStats } from "@/app/_components/dashboard/DashboardStats";
import { RecentStitchesSection } from "@/app/_components/dashboard/RecentStitchesSection";
import { RecentSwipesSection } from "@/app/_components/dashboard/RecentSwipesSection";
import { RecentUploadsSection } from "@/app/_components/dashboard/RecentUploadsSection";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <span>User menu</span>,
}));

vi.mock("convex/react", () => ({
  useConvexAuth: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
  })),
  useQuery: vi.fn(() => []),
  useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("@/app/_components/dashboard/UploadDestinationMenuButton", () => ({
  UploadDestinationMenuButton: () => <button type="button">Upload</button>,
}));

vi.mock("@/app/_components/dashboard/DashboardNotificationBell", () => ({
  DashboardNotificationBell: () => <button type="button">Notifications</button>,
}));

vi.mock("@/app/_components/dashboard/DashboardProductSwitcher", () => ({
  DashboardProductSwitcher: () => <button type="button">Product</button>,
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/app/_components/dashboard/StitchCard", () => ({
  StitchCard: ({ stitch }: { stitch: Stitch }) => (
    <article>Stitch {stitch.id}</article>
  ),
}));

vi.mock("@/app/_components/dashboard/SwiprSwipeCard", () => ({
  SwiprSwipeCard: ({ swipe }: { swipe: SwiprSwipe }) => (
    <article>Swipe {swipe.id}</article>
  ),
}));

vi.mock("@/app/_components/dashboard/VideoClipCard", () => ({
  VideoClipCard: ({ clip }: { clip: VideoClipMetadata }) => (
    <article>Clip {clip.id}</article>
  ),
}));

const noop = vi.fn();

describe("dashboard shell sections", () => {
  beforeEach(() => {
    vi.mocked(useConvexAuth).mockReset();
    vi.mocked(useConvexAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    vi.mocked(useQuery).mockReset();
    vi.mocked(useQuery).mockReturnValue([]);
    vi.mocked(useMutation).mockReset();
    vi.mocked(useMutation).mockReturnValue(
      vi.fn() as unknown as ReturnType<typeof useMutation>,
    );
  });

  it("renders headers, shell navigation, sidebar links, and stats", () => {
    const headerMarkup = renderToStaticMarkup(<DashboardHeader />);
    const customHeaderMarkup = renderToStaticMarkup(
      <DashboardPageHeader
        eyebrow="Library"
        title="Uploads"
        description="Manage assets."
        actions={<button type="button">Custom action</button>}
      />,
    );
    const shellMarkup = renderToStaticMarkup(
      <DashboardShell>
        <p>Workspace child</p>
      </DashboardShell>,
    );
    const sidebarMarkup = renderToStaticMarkup(<DashboardSidebar />);
    const statsMarkup = renderToStaticMarkup(
      <DashboardStats ugcCount={1} demoCount={2} stitchesCount={4} />,
    );

    expect(headerMarkup).toContain("Welcome to ClipStitchr");
    expect(customHeaderMarkup).toContain("Custom action");
    expect(shellMarkup).toContain("Workspace child");
    expect(sidebarMarkup).toContain("Library");
    expect(sidebarMarkup).toContain("Stitchr");
    expect(sidebarMarkup).not.toContain("Templates");
    expect(sidebarMarkup).not.toContain("Avatars");
    expect(sidebarMarkup).toContain("Settings");
    expect(statsMarkup).toContain("Demo Videos");
    expect(statsMarkup).toContain("4");
  });

  it("renders a background job banner when workers are still running", () => {
    vi.mocked(useQuery)
      .mockReturnValueOnce([
        {
          id: "provider_job_1",
          jobType: "manual-swapr",
          stage: "queued",
          status: "queued",
        },
      ])
      .mockReturnValueOnce([
        {
          id: "media_job_1",
          jobType: "upload-normalization",
          stage: "claimed",
          status: "running",
        },
      ]);

    const markup = renderToStaticMarkup(
      <DashboardShell>
        <p>Workspace child</p>
      </DashboardShell>,
    );

    expect(markup).toContain("Background AI work is running");
    expect(markup).toContain("Swapr generation queued");
    expect(markup).toContain("Upload processing running");
  });

  it("renders empty states for recent dashboard sections", () => {
    const markup = renderToStaticMarkup(
      <>
        <RecentStitchesSection
          demoClips={[]}
          stitches={[]}
          onDelete={noop}
          onLoadClip={async () => null}
          onUpdateMusic={noop}
          onUpdatePostedStatus={noop}
          onUpdateSocialCaption={noop}
          onUpdateSourceSettings={noop}
          onUpdateTextOverlay={noop}
          ugcClips={[]}
        />
        <RecentSwipesSection
          backgrounds={[]}
          swipes={[]}
          onDelete={noop}
          onLoadBackgroundBlob={async () => new Blob()}
        />
        <RecentUploadsSection
          clips={[]}
          onDelete={noop}
          onLoadClip={async () => null}
          onUpdateMetadata={noop}
          onUpdateTrim={noop}
        />
      </>,
    );

    expect(markup).toContain("No stitches yet");
    expect(markup).toContain("No Swipes yet");
    expect(markup).toContain("No uploads yet");
  });

  it("renders populated recent dashboard cards and keeps missing-background Swipes visible", () => {
    const markup = renderToStaticMarkup(
      <>
        <RecentStitchesSection
          demoClips={[]}
          stitches={[{ id: "stitch_1" } as Stitch]}
          onDelete={noop}
          onLoadClip={async () => null}
          onUpdateMusic={noop}
          onUpdatePostedStatus={noop}
          onUpdateSocialCaption={noop}
          onUpdateSourceSettings={noop}
          onUpdateTextOverlay={noop}
          ugcClips={[]}
        />
        <RecentSwipesSection
          backgrounds={[{ id: "background_1" } as SwiprBackgroundAsset]}
          swipes={[
            { backgroundId: "background_1", id: "swipe_1" } as SwiprSwipe,
            { backgroundId: "missing_background", id: "swipe_2" } as SwiprSwipe,
          ]}
          onDelete={noop}
          onLoadBackgroundBlob={async () => new Blob()}
        />
        <RecentUploadsSection
          clips={[{ id: "clip_1" } as VideoClipMetadata]}
          onDelete={noop}
          onLoadClip={async () => null}
          onUpdateMetadata={noop}
          onUpdateTrim={noop}
        />
      </>,
    );

    expect(markup).toContain("Stitch stitch_1");
    expect(markup).toContain("Swipe swipe_1");
    expect(markup).toContain("Swipe swipe_2");
    expect(markup).toContain("Clip clip_1");
  });
});
