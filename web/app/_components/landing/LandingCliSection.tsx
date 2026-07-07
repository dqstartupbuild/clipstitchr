import { ArrowRight, ListVideo, MonitorUp, Terminal } from "lucide-react";
import Link from "next/link";

const cliSteps = [
  {
    title: "Connect your repo",
    description:
      "Install the command, sign in once, and let ClipStitchr remember the product this repo belongs to.",
    icon: Terminal,
  },
  {
    title: "Follow a demo guide",
    description:
      "Create a simple checklist, record the product, and save step timing for cleaner edits later.",
    icon: MonitorUp,
  },
  {
    title: "Queue finished work",
    description:
      "Send ready Stitches to the posting queue without picking a date or time by hand.",
    icon: ListVideo,
  },
];

export function LandingCliSection() {
  return (
    <section className="scroll-mt-24 px-6 py-24" id="clipstitchr-cli">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="marketing-eyebrow">ClipStitchr CLI</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Run product work from the repo you already have open.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            The ClipStitchr CLI guides local demo recordings, starts batch
            content, checks your library, and queues finished Stitches without
            making you jump between tools.
          </p>
          <Link
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-text-inverse transition-colors hover:bg-accent-light"
            href="/docs/clipstitchr-cli"
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
            <code>
              {
                "npm install -g clipstitchr\nclipstitchr demo make\nclipstitchr stitchr batch"
              }
            </code>
          </pre>
        </div>

        <div className="grid gap-4 lg:col-span-2 md:grid-cols-3">
          {cliSteps.map((step) => {
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
