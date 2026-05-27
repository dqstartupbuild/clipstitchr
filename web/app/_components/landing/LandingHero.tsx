import Image from "next/image";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

const secondaryButtonClassName =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
            Ad variants without the editing
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-[1.05] text-text-primary md:text-6xl">
            Turn your UGC into
            <br className="hidden md:block" />
            <span className="mt-2 block text-accent md:mt-0 md:inline">
              finished ads.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            Upload creator clips and product demos once. Pick a UGC hook, pair
            it with a demo, and create vertical ad variants without opening a
            timeline editor. Sequence multiple clips into a Long when you need a
            longer vertical video.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <TrackedButtonLink
              href="/dashboard"
              className={PRIMARY_BUTTON_CLASS_NAME}
              contentCategory="Landing page"
              contentId="hero_dashboard_button"
              contentName="Hero dashboard"
            >
              Go to Dashboard
            </TrackedButtonLink>
            <TrackedButtonLink
              href="#features"
              className={secondaryButtonClassName}
              contentCategory="Landing page"
              contentId="hero_workflow_button"
              contentName="Hero workflow"
            >
              See workflow
            </TrackedButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
