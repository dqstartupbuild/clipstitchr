import {
  ArrowRight,
  BarChart3,
  Bot,
  CirclePlay,
  FolderSearch,
  Gauge,
  Images,
  LayoutTemplate,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type LandingOfferFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  actionLabel?: string;
};

const features: LandingOfferFeature[] = [
  {
    title: "Finished ads from saved clips",
    description:
      "Turn saved clips and one product demo into vertical ads without dragging pieces around by hand.",
    icon: Scissors,
  },
  {
    title: "One library instead of chaos",
    description:
      "Keep UGC, demos, generated clips, carousels, and finished ads where you can find them.",
    icon: FolderSearch,
  },
  {
    title: "Scores before regrets",
    description:
      "Check source clips and finished ads before they waste a post or ad slot.",
    icon: Gauge,
  },
  {
    title: "Templates for repeat pain",
    description:
      "Save the setup that worked so the next one does not start from zero.",
    icon: LayoutTemplate,
  },
  {
    title: "Extra source clips",
    description:
      "Use Clipr and Swapr to create more source clips when the library is thin.",
    icon: CirclePlay,
  },
  {
    title: "Carousel drafts",
    description:
      "Use Swipr when the next post should be slides instead of another video.",
    icon: Images,
  },
  {
    title: "Daily drafts",
    description:
      "Let ClipStitchr prepare drafts you can review before anything goes live.",
    icon: Bot,
  },
  {
    title: "Scheduling after the draft is ready",
    description:
      "Send finished work through Post Bridge and bring simple results back to guide the next version.",
    icon: BarChart3,
    href: "/docs/post-bridge",
    actionLabel: "Read the Post Bridge guide",
  },
];

export function LandingOfferStackSection() {
  return (
    <section
      id="features"
      className="relative scroll-mt-24 bg-surface-muted/45 px-6 py-24"
    >
      <span id="offer-stack" className="absolute -top-24" />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="marketing-eyebrow">The toolkit</p>
            <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
              Every tool feeds one library.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-text-secondary">
              AI helps fill gaps, but the point is simpler: keep clips, drafts,
              carousels, and finished ads in one place so nothing gets lost
              between sessions.
            </p>
          </div>
          <Link
            href="/docs"
            className="hidden items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-accent hover:text-text-primary md:inline-flex"
          >
            See all features
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="marketing-card p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:border-accent/45"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent-dark">
                    <Icon aria-hidden className="h-5 w-5" />
                  </div>
                  {feature.href ? (
                    <Link
                      href={feature.href}
                      className="text-xs font-bold text-accent-dark transition-colors hover:text-accent-light"
                    >
                      Guide
                    </Link>
                  ) : null}
                </div>
                <h3 className="marketing-subheading mt-5 text-2xl text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {feature.description}
                </p>
                {feature.href ? (
                  <Link
                    href={feature.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent-dark transition-colors hover:text-accent-light"
                  >
                    {feature.actionLabel}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
