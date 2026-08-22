import Link from "next/link";
import { LandingDashboardCta } from "@/app/_components/landing/LandingDashboardCta";
import { LandingHeroOutput } from "@/app/_components/landing/LandingHeroOutput";

export function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-copy">
        <p className="landing-audience">For builders with footage, not an editing team.</p>
        <h1 className="landing-display landing-hero-title">
          <span className="block whitespace-nowrap">Your clips.</span>
          <span className="block whitespace-nowrap">Your campaign.</span>
        </h1>
        <div className="landing-hero-intro">
          <p>
            Turn UGC clips and product demos into finished short-form app ads.
            Review, test, and post vertical videos for TikTok, Instagram Reels,
            and YouTube Shorts without spending your week editing.
          </p>
          <div className="landing-hero-actions">
            <LandingDashboardCta
              className="landing-primary-action"
              contentId="hero_start_clips_button"
              contentName="Hero start clips"
              signedOutLabel="Get ClipStitchr"
            />
            <Link className="landing-text-link" href="/examples">
              See 21 real outputs
            </Link>
          </div>
          <p className="landing-price-note">
            Paid plans start at $39/month. Every tool is included.
          </p>
        </div>
      </div>
      <LandingHeroOutput />
    </section>
  );
}
