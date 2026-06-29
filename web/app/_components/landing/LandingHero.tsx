import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function LandingHero() {
  return (
    <section className="relative min-h-[72svh] overflow-hidden border-b border-border md:min-h-[82svh]">
      <Image
        src="/mockups/clipstitchr-product-mockup.png"
        alt=""
        fill
        className="object-cover object-center opacity-25"
        priority
        sizes="100vw"
      />
      <div className="landing-hero-scrim absolute inset-0" />

      <div className="relative mx-auto flex min-h-[72svh] w-full max-w-6xl items-start px-6 pb-16 pt-24 md:min-h-[82svh] md:items-center md:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            For builders who hate content
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] text-text-primary sm:text-5xl md:mt-5 md:text-6xl">
            Make short-form ads without becoming a content person.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary md:mt-6 md:max-w-2xl md:text-lg md:leading-8">
            If you&apos;re trying to grow a mobile app on TikTok and Reels but
            the whole content thing makes you want to quit, ClipStitchr is
            built for you.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
            <TrackedButtonLink
              href="/dashboard"
              className={PRIMARY_BUTTON_CLASS_NAME}
              contentCategory="Landing page"
              contentId="hero_start_clips_button"
              contentName="Hero start clips"
            >
              Start with your clips
              <ArrowRight aria-hidden className="h-4 w-4" />
            </TrackedButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
