import { CheckCircle2 } from "lucide-react";

const hookLabPoints = [
  "Paste hooks from viral posts in your niche during setup.",
  "Add hooks you already posted and would use again.",
  "Tell ClipStitchr which hooks sound too bland, too fake, or off-brand.",
];

export function LandingHookLabSection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Hook Lab</p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Your hooks should sound like your best posts, not a prompt.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            During onboarding, ClipStitchr asks for hooks that already stop
            people in your market. Stitchr uses that taste file to write better
            overlay text and gives you options before you export.
          </p>
        </div>
        <div className="grid gap-3">
          {hookLabPoints.map((point) => (
            <div
              key={point}
              className="flex gap-3 rounded-lg border border-border bg-surface px-4 py-3"
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
