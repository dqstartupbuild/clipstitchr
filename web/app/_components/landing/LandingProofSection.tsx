import Image from "next/image";
import Link from "next/link";
import { LandingProofMetric } from "@/app/_components/landing/LandingProofMetric";

const proofMetrics = [
  { value: "75", label: "reels published" },
  { value: "58K+", label: "organic views" },
  { value: "161K+", label: "total views" },
];

export function LandingProofSection() {
  return (
    <section className="landing-proof" aria-labelledby="landing-proof-heading">
      <div className="landing-proof-image-wrap">
        <Image
          alt="Guppy Calisthenics short-form videos made with ClipStitchr"
          className="landing-proof-image"
          fill
          sizes="(min-width: 900px) 50vw, 100vw"
          src="/case-studies/guppy-30-day-growth/feature-image.jpg"
        />
      </div>
      <div className="landing-proof-copy">
        <p className="landing-section-intro">One founder. One month of shipping.</p>
        <h2 className="landing-display" id="landing-proof-heading">
          75 reels. One month.
        </h2>
        <p>
          Guppy used ClipStitchr while the app itself was still being built. The
          point was not one perfect ad. It was making 75 honest attempts
          realistic enough to finish.
        </p>
        <div className="landing-proof-metrics">
          {proofMetrics.map((metric) => (
            <LandingProofMetric key={metric.label} {...metric} />
          ))}
        </div>
        <p className="landing-proof-context">
          Results include organic and paid distribution. They describe this
          campaign, not a guarantee for the next one.
        </p>
        <Link
          className="landing-text-link"
          href="/case-studies/fitness-app-growth-case-study-guppy"
        >
          Read the 30-day case study
        </Link>
      </div>
    </section>
  );
}
