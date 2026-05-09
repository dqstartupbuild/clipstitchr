import { ArrowRight } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";

export function StitchrCallout() {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface-muted p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Let's make another ad! 
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Pick a UGC clip, pair it with a demo, and create a finished
            ad.
          </p>
        </div>
      </div>
      <PrimaryButtonLink
        href="/dashboard/stitchr"
        icon={<ArrowRight aria-hidden className="h-4 w-4" />}
      >
        Create Stitch
      </PrimaryButtonLink>
    </section>
  );
}
