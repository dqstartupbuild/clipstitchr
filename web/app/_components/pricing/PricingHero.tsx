import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";

export function PricingHero() {
  return (
    <section className="pricing-hero">
      <div className="pricing-hero-inner">
        <p className="marketing-eyebrow">ClipStitchr pricing</p>
        <h1 className="marketing-heading">Pick your pace.</h1>
        <div className="pricing-hero-detail">
          <p>
            Stitchr, scoring, Hook Lab post analysis, and your clip library are
            included. Connect your Zernio account to publish on TikTok,
            Instagram Reels, and YouTube Shorts. Creation credits cover everyday
            output, with a separate Clipr and Swapr video allowance.
          </p>
          <PrimaryButtonLink href="#plans">Choose a plan</PrimaryButtonLink>
        </div>
      </div>
    </section>
  );
}
