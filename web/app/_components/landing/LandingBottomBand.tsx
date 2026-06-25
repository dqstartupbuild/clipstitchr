import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function LandingBottomBand() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-lg border border-border bg-surface-muted p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">
            You can grow on short-form without becoming a content person.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Start with the clips and demos you already have. ClipStitchr handles
            the parts that make you avoid posting.
          </p>
        </div>
        <TrackedButtonLink
          href="/dashboard"
          className={PRIMARY_BUTTON_CLASS_NAME}
          contentCategory="Landing page"
          contentId="bottom_start_clips_button"
          contentName="Bottom start clips"
        >
          Start with your clips
          <ArrowRight aria-hidden className="h-4 w-4" />
        </TrackedButtonLink>
      </div>
    </section>
  );
}
