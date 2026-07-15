import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";

export function PricingHero() {
  return (
    <section className="pricing-hero">
      <div className="pricing-hero-inner">
        <p className="marketing-eyebrow">ClipStitchr pricing</p>
        <h1 className="marketing-heading">Pick your pace.</h1>
        <div className="pricing-hero-detail">
          <p>
            Stitchr, scoring, Hook Lab Ideas, and your clip library are
            included. Credits only matter when ClipStitchr creates extra videos,
            visuals, or drafts because your library is thin.
          </p>
          <PrimaryButtonLink href="#plans">Choose a plan</PrimaryButtonLink>
        </div>
      </div>
    </section>
  );
}
