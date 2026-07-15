import Image from "next/image";

const workflowMoments = [
  {
    title: "Bring the footage",
    description:
      "Upload Hook/UGC clips and product demos once. Originals stay untouched while working copies are prepared for vertical video.",
  },
  {
    title: "Choose the batch",
    description:
      "Pick up to 20 hooks and one demo. Keep one shared overlay, trim, caption setup, and export choice across the whole run.",
  },
  {
    title: "Review the ads",
    description:
      "Every hook becomes its own finished Stitch. Keep the winners, fix the weak ones, and download only what is ready.",
  },
];

export function LandingWorkflow() {
  return (
    <section className="landing-workflow" id="workflow">
      <div className="landing-workflow-copy">
        <p className="landing-section-intro">
          The repetitive edit happens once. The useful variations stay separate.
        </p>
        <h2 className="landing-display">One demo in. Ads out.</h2>
      </div>
      <div className="landing-product-artifact">
        <Image
          alt="Guppy production library inside ClipStitchr"
          className="landing-product-image"
          height={1086}
          sizes="(min-width: 1280px) 1180px, calc(100vw - 32px)"
          src="/case-studies/guppy-30-day-growth/clipstitchr-stitches-production.png"
          width={2054}
        />
        <p className="landing-artifact-caption">
          Guppy’s production workspace: 68 source clips, four demos, and 59
          finished Stitches during the campaign.
        </p>
      </div>
      <div className="landing-workflow-moments">
        {workflowMoments.map((moment, index) => (
          <article key={moment.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{moment.title}</h3>
            <p>{moment.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
