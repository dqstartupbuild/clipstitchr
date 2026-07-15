import Link from "next/link";
import { LandingDashboardCta } from "@/app/_components/landing/LandingDashboardCta";

export function LandingBottomBand() {
  return (
    <section className="landing-close">
      <p className="landing-close-count">20 hooks + 1 demo</p>
      <h2 className="landing-display">Make the batch. Keep building.</h2>
      <div className="landing-close-actions">
        <LandingDashboardCta
          className="landing-primary-action"
          contentId="bottom_start_clips_button"
          contentName="Bottom start clips"
          signedOutLabel="Get ClipStitchr"
        />
        <Link className="landing-text-link" href="/pricing">
          Plans from $39/month
        </Link>
      </div>
    </section>
  );
}
