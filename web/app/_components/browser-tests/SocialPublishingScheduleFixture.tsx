import { SocialScheduledPostsPanel } from "@/app/_components/social/SocialScheduledPostsPanel";

export function SocialPublishingScheduleFixture() {
  return (
    <section aria-labelledby="browser-schedule-workflow">
      <h2 id="browser-schedule-workflow" className="sr-only">
        Scheduled content
      </h2>
      <SocialScheduledPostsPanel
        isLoading={false}
        nextSlot="2026-08-01T14:30:00.000Z"
        posts={[]}
      />
    </section>
  );
}
