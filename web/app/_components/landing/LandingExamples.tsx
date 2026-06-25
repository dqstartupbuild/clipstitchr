import { getPublicVideoExamples } from "@/lib/clipstitchr/example-outputs/getPublicVideoExamples";

export function LandingExamples() {
  const examples = getPublicVideoExamples().slice(0, 6);

  if (examples.length === 0) {
    return null;
  }

  return (
    <section
      id="examples"
      className="scroll-mt-24 bg-background px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            Examples
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Examples of drafts builders can make.
          </h2>
          <p className="mt-3 text-sm text-text-tertiary">
            Sample outputs from ClipStitchr. No fake metrics attached.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {examples.map((example) => (
            <div
              key={example.id}
              className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <div className="aspect-[9/16] bg-surface-elevated">
                <video
                  aria-label={example.title}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  poster={example.thumbnailSrc}
                  preload="metadata"
                  src={example.videoSrc}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}