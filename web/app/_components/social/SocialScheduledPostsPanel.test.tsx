import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SocialScheduledPostsPanel } from "./SocialScheduledPostsPanel";

describe("SocialScheduledPostsPanel", () => {
  it("keeps the Post Bridge summary and list structure for an empty schedule", () => {
    const markup = renderToStaticMarkup(
      <SocialScheduledPostsPanel
        isLoading={false}
        nextSlot="2026-08-01T14:30:00.000Z"
        posts={[]}
      />,
    );

    expect(markup).toContain('aria-label="Schedule summary"');
    expect(markup).toContain("Scheduled content");
    expect(markup).toContain("Next open product time");
    expect(markup).toContain("No scheduled content yet.");
  });
});
