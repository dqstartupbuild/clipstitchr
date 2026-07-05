import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function LandingBottomBand() {
  return (
    <section className="bg-surface-muted/45 px-6 py-24">
      <div className="marketing-card relative mx-auto max-w-6xl overflow-hidden p-10 text-center md:p-16">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.24),transparent_68%)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <p className="marketing-eyebrow mx-auto">Ready to ship?</p>
          <h2 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            Upload once.
            <br />
            <span className="text-accent-dark">Create everything.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-text-secondary">
            Start with the clips and demos you already have. ClipStitchr handles
            the repetitive parts that make you avoid posting.
          </p>
          <TrackedButtonLink
            href="/dashboard"
            className={`${PRIMARY_BUTTON_CLASS_NAME} mt-8`}
            contentCategory="Landing page"
            contentId="bottom_start_clips_button"
            contentName="Bottom start clips"
          >
            Start for free
            <ArrowRight aria-hidden className="h-4 w-4" />
          </TrackedButtonLink>
        </div>
      </div>
    </section>
  );
}
