import { LandingExampleOutputVideoCard } from "@/app/_components/landing/LandingExampleOutputVideoCard";
import { getPublicVideoExamples } from "@/lib/clipstitchr/example-outputs/getPublicVideoExamples";

const marqueeRows = [0, 1];

export function LandingExampleOutputSection() {
  const examples = getPublicVideoExamples();

  return (
    <section
      aria-label="Example ClipStitchr outputs"
      className="overflow-hidden px-0 py-12"
      id="example-output-reel"
    >
      <div className="landing-example-output-marquee flex w-max">
        {marqueeRows.map((rowIndex) => (
          <div
            aria-hidden={rowIndex === 1}
            className="flex shrink-0 gap-4 pr-4"
            key={rowIndex}
          >
            {examples.map((example, index) => (
              <LandingExampleOutputVideoCard
                example={example}
                index={index}
                key={`${rowIndex}-${example.id}`}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
