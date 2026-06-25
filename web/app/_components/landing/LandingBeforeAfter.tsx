import { Check, X } from "lucide-react";

const withoutSteps = [
  "Find the right UGC clip",
  "Find the product demo",
  "Drag clips into a timeline",
  "Rewrite the hook",
  "Trim the dead space",
  "Export one version",
  "Repeat from scratch tomorrow",
];

const withSteps = [
  "Upload clips once",
  "Pick one demo",
  "Generate a batch of drafts",
  "Score the weak ones",
  "Reuse the winning structure",
];

export function LandingBeforeAfter() {
  return (
    <section className="bg-background px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-text-primary md:text-4xl">
            Content feels heavy because the same tiny steps keep repeating.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Without Column */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                <X aria-hidden className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Without ClipStitchr
              </h3>
            </div>
            <ul className="mt-5 space-y-3">
              {withoutSteps.map((step) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm text-text-secondary"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-tertiary" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With Column */}
          <div className="rounded-2xl border-2 border-accent bg-white p-6 shadow-sm shadow-purple-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50">
                <Check aria-hidden className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                With ClipStitchr
              </h3>
            </div>
            <ul className="mt-5 space-y-3">
              {withSteps.map((step) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm font-semibold text-text-primary"
                >
                  <Check
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}