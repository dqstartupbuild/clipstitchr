import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ScheduledPostStatusBadge } from "@/app/_components/schedule/ScheduledPostStatusBadge";
import type { SocialPublishingPostStatus } from "@/lib/clipstitchr/types/SocialPublishingPostStatus";

const statuses: SocialPublishingPostStatus[] = [
  "failed",
  "partial",
  "posted",
  "processing",
  "scheduled",
];

describe("ScheduledPostStatusBadge", () => {
  it("uses the dashboard tonal palette for every status", () => {
    const markup = statuses
      .map((status) =>
        renderToStaticMarkup(<ScheduledPostStatusBadge status={status} />),
      )
      .join("");

    expect(markup).toContain("bg-surface-muted");
    expect(markup).toContain("bg-surface-elevated");
    expect(markup).not.toMatch(/(?:blue|emerald|green|orange|red|rose|teal)-/);
  });
});
