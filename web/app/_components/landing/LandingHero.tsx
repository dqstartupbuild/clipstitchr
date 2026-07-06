import { Check, Download, Play, Scissors, Zap } from "lucide-react";
import { LandingDashboardCta } from "@/app/_components/landing/LandingDashboardCta";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border pt-16 lg:min-h-[88svh]">
      <div className="marketing-grid-bg absolute inset-0" />
      <div className="absolute left-[12%] top-[18%] h-80 w-80 rounded-full bg-accent/20 blur-[120px]" />
      <div className="absolute right-0 top-[24%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[110px]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:min-h-[calc(88svh-4rem)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 lg:py-24">
        <div className="min-w-0 max-w-2xl">
          <p className="marketing-eyebrow">
            <Zap aria-hidden className="h-3.5 w-3.5 fill-current" />
            Built for indie builders and mobile marketers
          </p>
          <h1 className="marketing-heading mt-6 max-w-full text-4xl text-text-primary sm:text-6xl md:text-7xl lg:text-8xl">
            Turn raw footage into finished ads.{" "}
            <span className="text-accent-dark">Fast.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-text-secondary md:text-lg md:leading-8">
            Upload Hook/UGC clips and product demos once. Build a reusable library.
            Create polished TikTok and Reels verticals without rebuilding the
            same workflow every week.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <LandingDashboardCta
              className={PRIMARY_BUTTON_CLASS_NAME}
              contentId="hero_start_clips_button"
              contentName="Hero start clips"
              signedOutLabel="Start for free"
            />
            <a
              href="#example-output-reel"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent hover:bg-surface-elevated"
            >
              <Play aria-hidden className="h-3.5 w-3.5 fill-current" />
              Watch examples
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-text-tertiary">
            {["No credit card", "14-day free trial", "Cancel anytime"].map(
              (item) => (
                <span className="inline-flex items-center gap-1.5" key={item}>
                  <Check aria-hidden className="h-3.5 w-3.5 text-accent" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="flex max-w-full items-end justify-center gap-2 pb-2 sm:gap-4 lg:justify-start lg:pb-6">
          <div className="mb-12 flex flex-col items-center gap-3">
            <div className="aspect-[9/16] w-[92px] rotate-[-5deg] overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface shadow-[0_24px_60px_rgba(251,146,60,0.2)] sm:w-[118px] lg:w-[142px]">
              <div className="flex h-full flex-col justify-between bg-gradient-to-b from-orange-500/70 via-rose-700/50 to-slate-950 p-3">
                <div className="flex items-start justify-between">
                  <span className="text-[9px] text-white/55">
                    ugc_take_4.mp4
                  </span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                    <Play aria-hidden className="h-2.5 w-2.5 fill-white text-white" />
                  </span>
                </div>
                <div>
                  <p className="marketing-subheading text-xs text-white">
                    Hook clip
                  </p>
                  <div className="mt-2 h-1 rounded-full bg-white/20">
                    <div className="h-full w-1/3 rounded-full bg-white/70" />
                  </div>
                  <p className="mt-1 text-[9px] text-white/45">0:07 / 0:22</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-text-tertiary">Hook/UGC clip</p>
          </div>

          <div className="z-10 flex scale-105 flex-col items-center gap-3 lg:scale-110">
            <div className="aspect-[9/16] w-[98px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface shadow-[0_24px_64px_rgba(139,92,246,0.4)] sm:w-[126px] lg:w-[150px]">
              <div className="flex h-full flex-col bg-gradient-to-b from-accent/20 to-background">
                <div className="flex items-center justify-between border-b border-border/60 px-3 py-3">
                  <span className="marketing-subheading text-[10px] text-accent-dark">
                    Stitchr
                  </span>
                  <span className="text-[8px] text-text-tertiary">
                    3 clips
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2.5">
                  <div className="flex h-14 items-center justify-center rounded-lg border border-white/5 bg-gradient-to-br from-orange-500/60 to-rose-600/40">
                    <span className="text-[9px] font-semibold text-white">
                      Hook/UGC
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="h-px flex-1 bg-accent/25" />
                    <Zap aria-hidden className="h-2.5 w-2.5 text-accent" />
                    <div className="h-px flex-1 bg-accent/25" />
                  </div>
                  <div className="flex h-14 items-center justify-center rounded-lg border border-white/5 bg-gradient-to-br from-violet-600/60 to-purple-900/40">
                    <span className="text-[9px] font-semibold text-white">
                      Product demo
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-center gap-1 rounded-lg bg-accent py-2 shadow-[0_0_14px_rgba(139,92,246,0.45)]">
                    <Scissors aria-hidden className="h-2.5 w-2.5 text-white" />
                    <span className="text-[9px] font-bold text-white">
                      Create Stitch
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-text-tertiary">Stitchr</p>
          </div>

          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="aspect-[9/16] w-[92px] rotate-[5deg] overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface shadow-[0_24px_60px_rgba(240,89,208,0.2)] sm:w-[118px] lg:w-[142px]">
              <div className="flex h-full flex-col justify-between bg-gradient-to-b from-violet-700 via-purple-950 to-slate-950 p-3">
                <div className="flex justify-end">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8px] text-white/75">
                    TikTok ready
                  </span>
                </div>
                <div>
                  <p className="marketing-subheading text-xs text-white">
                    Ready to download
                  </p>
                  <div className="mt-2 flex gap-1">
                    <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[8px] text-white/75">
                      <Download aria-hidden className="h-2.5 w-2.5" />
                      Save
                    </span>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-white" />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-text-tertiary">Finished ad</p>
          </div>
        </div>
      </div>
    </section>
  );
}
