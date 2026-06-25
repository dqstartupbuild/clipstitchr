import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function LandingFinalCta() {
  return (
    <section className="bg-background px-6 py-16 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-text-primary md:text-5xl">
          You can grow on short-form without becoming a content person.
        </h2>
        <p className="mt-6 text-lg leading-8 text-text-secondary">
          Start with the clips and demos you already have. ClipStitchr handles
          the repetitive parts that make you avoid posting.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <TrackedButtonLink
            href="/dashboard"
            className={PRIMARY_BUTTON_CLASS_NAME}
            contentCategory="Landing page"
            contentId="final_start_clips_button"
            contentName="Final start clips"
          >
            Start with your clips
            <ArrowRight aria-hidden className="h-4 w-4" />
          </TrackedButtonLink>
        </div>
      </div>
    </section>
  );
}