import { Panel } from "@/app/_components/ui/Panel";

const workflows = [
  {
    eyebrow: "Stitchr",
    title: "Start with the clips you have. Leave with an ad you can use.",
    description:
      "Build a reusable library, choose the UGC and demo that belong together, make quick trims, and create another finished ad variant.",
    steps: ["Upload", "Organize", "Pick UGC", "Pick Demo", "Create", "Download"],
  },
  {
    eyebrow: "Clipr",
    title: "Create a talking engagement clip when the library needs a spark.",
    description:
      "Choose a saved product and avatar photo, pick a length and voice, then save the no-CTA clip for posting or stitching.",
    steps: ["Pick Product", "Pick Avatar", "Pick Voice", "Create", "Save"],
  },
  {
    eyebrow: "Swapr",
    title: "Make another UGC clip when your library needs one.",
    description:
      "Choose an avatar photo and a clip, create the swap, then save it with the rest of your UGC for the next ad batch.",
    steps: ["Pick Avatar", "Pick Clip", "Create", "Save"],
  },
  {
    eyebrow: "Swipr",
    title: "Make a carousel when slides fit better than video.",
    description:
      "Choose a product, pick a look, edit the slides, and save the carousel so it is ready whenever you want to download it.",
    steps: ["Pick Product", "Pick Look", "Edit Slides", "Download"],
  },
];

export function LandingWorkflow() {
  return (
    <section id="workflow" className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Three ways to turn your library into something ready to post.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Stitchr is the main workflow. Clipr, Swapr, and Swipr help when you
            need more source clips or a carousel instead of another video.
          </p>
        </div>
        <div className="mt-10 grid gap-10">
          {workflows.map((workflow) => (
            <div key={workflow.eyebrow}>
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-accent-dark">
                  {workflow.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-text-primary">
                  {workflow.title}
                </h3>
                <p className="mt-3 leading-7 text-text-secondary">
                  {workflow.description}
                </p>
              </div>
              <div
                className={[
                  "mt-5 grid gap-3 sm:grid-cols-2",
                  workflow.steps.length === 6
                    ? "lg:grid-cols-6"
                    : workflow.steps.length === 5
                      ? "lg:grid-cols-5"
                      : "lg:grid-cols-4",
                ].join(" ")}
              >
                {workflow.steps.map((step, index) => (
                  <Panel key={`${workflow.eyebrow}-${step}`} className="p-4">
                    <span className="text-xs font-semibold text-text-tertiary">
                      Step {index + 1}
                    </span>
                    <h4 className="mt-2 text-base font-bold text-text-primary">
                      {step}
                    </h4>
                  </Panel>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
