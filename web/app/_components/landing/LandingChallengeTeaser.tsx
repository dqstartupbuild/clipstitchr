import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingChallengeTeaser() {
  return (
    <section className="bg-white px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-border bg-surface-muted p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-semibold text-accent-dark">
                10k Organic Views Challenge
              </p>
              <h2 className="mt-3 text-2xl font-bold text-text-primary md:text-3xl">
                Publish 30 ClipStitchr-made posts in 30 days.
              </h2>
              <p className="mt-4 text-base leading-7 text-text-secondary">
                If they do not reach 10k total organic views, your next month
                is on us.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                See pricing details
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <p className="text-xs text-text-tertiary">
                Views count across public TikTok, Reels, and Shorts posts. No
                paid boosting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}