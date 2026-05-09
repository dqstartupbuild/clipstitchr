import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,rgba(243,244,246,0.88)_44%,rgba(243,244,246,0.45)_100%)]" />

      <div className="relative mx-auto flex min-h-[82svh] w-full max-w-6xl items-center px-6 py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            Ad variants without the editing grind
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-[1.05] text-text-primary md:text-6xl">
            Turn your UGC pile into
            <br className="hidden md:block" />
            <span className="mt-2 block text-accent md:mt-0 md:inline">
              finished ads.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            Upload creator clips and product demos once. Pick a UGC hook, pair
            it with a demo, and create vertical ad variants without opening a
            timeline editor.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryButtonLink
              href="/dashboard"
              icon={<ArrowRight aria-hidden className="h-4 w-4" />}
            >
              Go to Dashboard
            </PrimaryButtonLink>
            <SecondaryButtonLink
              href="#features"
              icon={<Sparkles aria-hidden className="h-4 w-4" />}
            >
              See workflow
            </SecondaryButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
