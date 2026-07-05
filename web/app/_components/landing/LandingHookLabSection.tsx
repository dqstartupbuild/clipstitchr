import { CheckCircle2 } from "lucide-react";

const hookLabPoints = [
  "Paste lines from posts that made you stop scrolling, including your own.",
  "Add examples that sounded fake so ClipStitchr knows what not to write.",
  "Review options before export instead of pretending the first line is fine.",
];

export function LandingHookLabSection() {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div>
          <p className="marketing-eyebrow">Hook Lab</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Writing overlay text that does not sound fake is annoyingly hard.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            Hook Lab exists because most builders are not natural copywriters.
            Give ClipStitchr a few lines that feel right, a few that do not,
            and it will write Stitchr options that sound less like a prompt.
          </p>
        </div>
        <div className="grid gap-3">
          {hookLabPoints.map((point) => (
            <div
              key={point}
              className="marketing-card flex gap-3 px-4 py-3"
            >
              <CheckCircle2
                aria-hidden
                className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              />
              <p className="text-sm leading-6 text-text-secondary">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
