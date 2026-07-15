import { ArrowRight } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";

export function StitchrCallout() {
  return (
    <section className="dashboard-stitchr-callout flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)] md:flex-row md:items-center md:justify-between">
      <div className="flex gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Need another ad?
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Pair a Hook/UGC clip with a demo and save a finished Stitch without
            rebuilding the workflow.
          </p>
        </div>
      </div>
      <PrimaryButtonLink
        href="/dashboard/stitchr"
        icon={<ArrowRight aria-hidden className="h-4 w-4" />}
      >
        Open Stitchr
      </PrimaryButtonLink>
    </section>
  );
}
