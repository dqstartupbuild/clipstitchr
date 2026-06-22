import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function LandingHero() {
  return (
    <section className="relative min-h-[82svh] overflow-hidden border-b border-border">
      <Image
        src="/mockups/clipstitchr-product-mockup.png"
        alt=""
        fill
        className="object-cover object-center opacity-25"
        priority
        sizes="100vw"
      />
      <div className="landing-hero-scrim absolute inset-0" />

      <div className="relative mx-auto flex min-h-[82svh] w-full max-w-6xl items-center px-6 py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            Batch ad creation from saved clips
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-[1.05] text-text-primary md:text-6xl">
            Make more ad variants from the clips you already have.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            Upload your clips once. Pick the product demo. Click once to create
            a batch of finished vertical ads, ready to test across TikTok,
            Reels, and Shorts.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <TrackedButtonLink
              href="/dashboard"
              className={PRIMARY_BUTTON_CLASS_NAME}
              contentCategory="Landing page"
              contentId="hero_create_batch_button"
              contentName="Hero create batch"
            >
              Create your first batch
              <ArrowRight aria-hidden className="h-4 w-4" />
            </TrackedButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
