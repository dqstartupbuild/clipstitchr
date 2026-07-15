import Link from "next/link";

const capabilityChapters = [
  {
    marker: "CUT",
    title: "Turn the footage you have into ads you can test.",
    description:
      "Stitchr handles the repeat edit. The library keeps every hook, demo, score, trim, and finished ad where the next session can find it.",
    details: ["Batch up to 20 hooks", "One shared overlay", "Clip and Stitch scores"],
  },
  {
    marker: "FIND",
    title: "When the library gets thin, make the next useful source clip.",
    description:
      "Hook Lab remembers patterns worth repeating. Clipr and Swapr help fill a real footage gap without turning generated material into the whole strategy.",
    details: ["Hook Lab ideas", "Clipr source clips", "Swapr variations"],
  },
  {
    marker: "SHIP",
    title: "Carry the same product context past the video export.",
    description:
      "Build carousel drafts in Swipr, prepare daily drafts for review, or queue finished work through the CLI and Post Bridge when the campaign is ready.",
    details: ["Swipr carousels", "Review-first daily drafts", "CLI and scheduling"],
  },
];

export function LandingOfferStackSection() {
  return (
    <section className="landing-capabilities" id="features">
      <div className="landing-capabilities-heading">
        <h2 className="landing-display">One library. Three jobs.</h2>
        <p>
          ClipStitchr is built around the campaign loop, not a wall of unrelated
          AI tools.
        </p>
      </div>
      <div className="landing-capability-list">
        {capabilityChapters.map((chapter) => (
          <article className="landing-capability" key={chapter.marker}>
            <p className="landing-capability-marker">{chapter.marker}</p>
            <div>
              <h3>{chapter.title}</h3>
              <p>{chapter.description}</p>
            </div>
            <ul>
              {chapter.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="landing-capability-links">
        <Link className="landing-text-link" href="/docs">
          Explore the full workflow
        </Link>
        <Link className="landing-text-link" href="/docs/clipstitchr-cli">
          Set up the CLI
        </Link>
      </div>
    </section>
  );
}
