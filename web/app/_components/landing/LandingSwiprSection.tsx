import { Images } from "lucide-react";

const swiprSteps = ["Pick product", "Choose a look", "Edit slides", "Download"];

export function LandingSwiprSection() {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="marketing-eyebrow">
            For posts that should be slides
          </p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            When video feels like overkill, make the carousel and move on.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            Swipr turns the same product context into editable carousel drafts.
            Use it when the idea needs slides instead of another vertical
            video.
          </p>
        </div>
        <div className="marketing-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md border border-purple-200 bg-white px-2 py-1 text-xs font-bold text-accent-dark">
                <Images aria-hidden className="h-4 w-4" />
                Carousel draft
              </p>
              <h3 className="mt-4 text-xl font-bold text-text-primary">
                A post that does not need a timeline.
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Save the draft, edit the slides, and download when it is ready
                to publish.
              </p>
            </div>
            <Images aria-hidden className="h-9 w-9 shrink-0 text-accent" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {swiprSteps.map((step) => (
              <div
                key={step}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-text-primary"
              >
                {step}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-text-primary">
            Use video when movement matters. Use slides when the idea needs
            space.
          </div>
        </div>
      </div>
    </section>
  );
}
