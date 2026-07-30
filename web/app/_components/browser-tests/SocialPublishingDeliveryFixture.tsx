"use client";

import { useState } from "react";
import { SocialDeliveryRow } from "@/app/_components/social/SocialDeliveryRow";
import { Button } from "@/app/_components/ui/Button";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";

const publishedTarget = {
  platform: "tiktok",
  username: "clipstitchr_creator",
  status: "published",
  needsAttentionReason: undefined,
  lastErrorMessage: undefined,
} as SocialSchedulePost["targets"][number];

const needsAttentionTarget = {
  platform: "instagram",
  username: "clipstitchr_studio",
  status: "needs_attention",
  needsAttentionReason:
    "Instagram needs you to reconnect before this post can continue.",
  lastErrorMessage: undefined,
} as SocialSchedulePost["targets"][number];

export function SocialPublishingDeliveryFixture() {
  const [state, setState] = useState<"idle" | "loading" | "partial_failure">(
    "idle",
  );

  return (
    <section
      className="rounded-lg bg-surface p-4 sm:p-6"
      aria-labelledby="browser-delivery-workflow"
    >
      <h2
        id="browser-delivery-workflow"
        className="text-xl font-bold text-text-primary"
      >
        Delivery feedback
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        Check progress and independent account results without publishing
        anything.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          onClick={() => setState("loading")}
        >
          Show loading state
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setState("partial_failure")}
        >
          Show partial failure
        </Button>
      </div>

      {state === "loading" ? (
        <div className="mt-4 grid gap-2" role="status">
          <p className="text-sm font-semibold text-text-primary">
            Publishing to 2 accounts...
          </p>
          <ProgressBar
            ariaLabel="Social delivery progress"
            value={0.5}
          />
          <p className="text-sm text-text-secondary">
            One account has finished. The other is still processing.
          </p>
        </div>
      ) : null}

      {state === "partial_failure" ? (
        <div className="mt-4 divide-y divide-border" aria-label="Account results">
          <SocialDeliveryRow target={publishedTarget} />
          <SocialDeliveryRow target={needsAttentionTarget} />
        </div>
      ) : null}

      {state === "idle" ? (
        <p className="mt-4 text-sm font-semibold text-text-secondary">
          Choose a state to inspect.
        </p>
      ) : null}
    </section>
  );
}
