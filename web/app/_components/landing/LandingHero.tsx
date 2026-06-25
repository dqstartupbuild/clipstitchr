import { ArrowRight, Play } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-28 md:pb-24 md:pt-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="max-w-xl">
            <p className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-text-secondary">
              For solo app founders who hate content
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] text-text-primary md:text-5xl lg:text-6xl">
              Turn saved clips into short-form ads you can actually test.
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              Upload your UGC, b-roll, reactions, and product demos once.
              ClipStitchr helps you stitch batches of vertical ad drafts, score
              the weak spots, and reuse the structures that work.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
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
              <a
                href="#workflow"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent"
              >
                <Play aria-hidden className="h-4 w-4" />
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <HeroProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroProductMockup() {
  return (
    <div className="relative">
      {/* Clip Library Card */}
      <div className="absolute left-0 top-0 z-10 w-44 rounded-2xl border border-border bg-white p-3 shadow-lg shadow-slate-200/60 md:w-48">
        <p className="text-xs font-semibold text-text-tertiary">Clip Library</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="aspect-[9/16] rounded-md bg-gradient-to-br from-purple-200 to-purple-300" />
          <div className="aspect-[9/16] rounded-md bg-gradient-to-br from-blue-200 to-blue-300" />
          <div className="aspect-[9/16] rounded-md bg-gradient-to-br from-amber-200 to-amber-300" />
          <div className="aspect-[9/16] rounded-md bg-gradient-to-br from-green-200 to-green-300" />
        </div>
        <p className="mt-2 text-[10px] text-text-tertiary">12 clips saved</p>
      </div>

      {/* Product Demo Card */}
      <div className="absolute left-1/2 top-12 z-20 w-40 -translate-x-1/2 rounded-2xl border-2 border-accent bg-white p-3 shadow-xl shadow-purple-200/60 md:w-44">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-accent-dark">Product Demo</p>
          <div className="h-2 w-2 rounded-full bg-accent" />
        </div>
        <div className="mt-2 aspect-[9/16] rounded-md bg-gradient-to-br from-slate-700 to-slate-900" />
        <p className="mt-2 text-[10px] font-semibold text-text-primary">
          App walkthrough
        </p>
      </div>

      {/* Generated Stitches Card */}
      <div className="ml-auto w-full max-w-sm rounded-2xl border border-border bg-white p-4 shadow-lg shadow-slate-200/60">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary">
            Generated Stitches
          </p>
          <p className="text-xs text-text-tertiary">5 drafts</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="aspect-[9/16] rounded-md bg-gradient-to-br from-purple-100 to-purple-200 ring-1 ring-purple-300" />
          <div className="aspect-[9/16] rounded-md bg-gradient-to-br from-blue-100 to-blue-200 ring-1 ring-blue-300" />
          <div className="aspect-[9/16] rounded-md bg-gradient-to-br from-amber-100 to-amber-200 ring-1 ring-amber-300" />
        </div>

        {/* Score Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            Hook 88
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Pace 76
          </span>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            Stitch fit 90
          </span>
        </div>

        {/* Fix Note */}
        <div className="mt-3 rounded-md bg-surface-muted px-2 py-1.5 text-[11px] font-semibold text-text-primary">
          Cut the pause before the demo
        </div>
      </div>

      {/* Flow Line */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-tertiary">
        <span>clips + demo</span>
        <ArrowRight aria-hidden className="h-3 w-3" />
        <span className="font-semibold text-text-primary">drafts to review</span>
      </div>
    </div>
  );
}