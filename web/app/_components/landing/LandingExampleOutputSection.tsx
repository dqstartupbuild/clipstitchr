import Link from "next/link";
import { LandingExampleOutputVideoCard } from "@/app/_components/landing/LandingExampleOutputVideoCard";
import { getPublicVideoExamples } from "@/lib/clipstitchr/example-outputs/getPublicVideoExamples";

export function LandingExampleOutputSection() {
  const examples = getPublicVideoExamples().slice(3, 10);

  return (
    <section
      aria-labelledby="landing-output-heading"
      className="landing-output-section"
      id="example-output-reel"
    >
      <div className="landing-output-heading-row">
        <h2 className="landing-display" id="landing-output-heading">
          Built from real clips. Shown without a mockup.
        </h2>
        <Link className="landing-text-link" href="/examples">
          Open the full reel
        </Link>
      </div>
      <div className="landing-reel-viewport">
        <div className="landing-example-output-marquee">
          {[0, 1].map((rowIndex) => (
            <div
              aria-hidden={rowIndex === 1}
              className="landing-reel-row"
              key={rowIndex}
            >
              {examples.map((example, index) => (
                <LandingExampleOutputVideoCard
                  example={example}
                  key={`${rowIndex}-${example.id}`}
                  shouldLoad={rowIndex === 0 && index < 3}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
