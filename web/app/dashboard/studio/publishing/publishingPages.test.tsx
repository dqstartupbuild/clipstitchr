import { describe, expect, it } from "vitest";
import { PublishingCalendar } from "@/app/_components/publishing/calendar/PublishingCalendar";
import { PublishingComposer } from "@/app/_components/publishing/compose/PublishingComposer";
import { PublishingPosts } from "@/app/_components/publishing/posts/PublishingPosts";
import PublishingCalendarPage from "@/app/dashboard/studio/publishing/calendar/page";
import PublishingComposePage from "@/app/dashboard/studio/publishing/compose/page";
import PublishingPostsPage from "@/app/dashboard/studio/publishing/posts/page";

describe("publishing pages", () => {
  it("distinguishes a shared calendar date from the browser-local default", async () => {
    const explicit = await PublishingCalendarPage({
      searchParams: Promise.resolve({ date: "2026-08-02" }),
    });
    const fallback = await PublishingCalendarPage({
      searchParams: Promise.resolve({ date: "not-a-date" }),
    });

    expect(explicit.type).toBe(PublishingCalendar);
    expect(explicit.props).toEqual({
      initialDate: "2026-08-02",
      initialDateIsExplicit: true,
    });
    expect(fallback.props.initialDateIsExplicit).toBe(false);
  });

  it("passes only a supported saved-media descriptor into the composer", async () => {
    const valid = await PublishingComposePage({
      searchParams: Promise.resolve({ kind: "swipe", recordId: "swipe_1" }),
    });
    const invalid = await PublishingComposePage({
      searchParams: Promise.resolve({
        kind: ["swipe", "stitch"],
        recordId: "swipe_1",
      }),
    });

    expect(valid.type).toBe(PublishingComposer);
    expect(valid.props.mediaPrefill).toEqual({
      descriptor: { kind: "swipe", recordId: "swipe_1" },
      error: null,
    });
    expect(valid.props.thumbnailPrefill).toEqual({
      error: null,
      selection: null,
    });
    expect(invalid.props.mediaPrefill).toMatchObject({ descriptor: null });
  });

  it("prefills only a complete durable YouTube thumbnail selection", async () => {
    const page = await PublishingComposePage({
      searchParams: Promise.resolve({
        kind: "studio-clip-output",
        recordId: "clip_1",
        thumbnailKind: "library-media",
        thumbnailRecordId: "image_1",
        thumbnailRevision: "a".repeat(64),
      }),
    });

    expect(page.props.thumbnailPrefill).toEqual({
      error: null,
      selection: {
        media: { kind: "library-media", recordId: "image_1" },
        mediaRevision: "a".repeat(64),
      },
    });
  });

  it("drops unsupported post filters and identifiers at the route boundary", async () => {
    const element = await PublishingPostsPage({
      searchParams: Promise.resolve({
        id: { nested: "post_1" } as unknown as string,
        status: "not-a-status",
      }),
    });

    expect(element.type).toBe(PublishingPosts);
    expect(element.props).toEqual({ initialPostId: null, initialStatus: "all" });
  });
});
