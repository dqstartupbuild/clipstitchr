import { ArrowRight, MonitorUp, MousePointerClick, Terminal } from "lucide-react";
import Link from "next/link";

const demoCliSteps = [
  {
    title: "Run one command",
    description:
      "Install the CLI, connect the repo, and let it find the local app setup.",
    icon: Terminal,
  },
  {
    title: "Walk through the product",
    description:
      "The recorder opens your app so you can show the flow the way a customer would see it.",
    icon: MousePointerClick,
  },
  {
    title: "Save it as a Demo",
    description:
      "The recording lands in ClipStitchr ready to pair with Hook/UGC clips.",
    icon: MonitorUp,
  },
];

export function LandingDemoCliSection() {
  return (
    <section className="scroll-mt-24 px-6 py-24" id="demo-cli">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="marketing-eyebrow">Product demos</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Record your app without turning it into another editing job.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            The ClipStitchr CLI helps founders capture clean product demos from
            a local app and send them straight to the Demo library.
          </p>
          <Link
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-text-inverse transition-colors hover:bg-accent-light"
            href="/docs/demo-cli"
          >
            Set up the CLI
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <div className="marketing-card overflow-hidden">
          <div className="border-b border-border bg-surface-elevated px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <Terminal aria-hidden className="h-4 w-4 text-accent-dark" />
              clipstitchr
            </div>
          </div>
          <pre className="overflow-x-auto px-5 py-5 text-sm font-semibold leading-7 text-text-primary">
            <code>{"npm install -g clipstitchr\nclipstitchr"}</code>
          </pre>
        </div>

        <div className="grid gap-4 lg:col-span-2 md:grid-cols-3">
          {demoCliSteps.map((step) => {
            const Icon = step.icon;

            return (
              <article className="marketing-card p-5" key={step.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
