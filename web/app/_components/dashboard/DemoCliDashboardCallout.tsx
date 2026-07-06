import { ArrowRight, Terminal } from "lucide-react";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

export function DemoCliDashboardCallout() {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)] lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-bold text-accent-dark">
          <Terminal aria-hidden className="h-4 w-4" />
          Demo CLI
        </div>
        <h2 className="mt-3 text-lg font-bold text-text-primary">
          Record product demos from your local app.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Install the command, connect this repo, walk through the product, and
          send the recording to your Demo library.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-bold text-text-primary">
          npm install -g clipstitchr
        </code>
        <SecondaryButtonLink
          href="/docs/demo-cli"
          icon={<ArrowRight aria-hidden className="h-4 w-4" />}
        >
          Setup guide
        </SecondaryButtonLink>
      </div>
    </section>
  );
}
