import { ArrowRight } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";

export function LandingBottomBand() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-lg border border-border bg-surface-muted p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">
            Turn your clip library into the next ad batch.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Upload UGC and demos once, keep them organized, and create finished
            ad variants whenever you need new creative to test.
          </p>
        </div>
        <PrimaryButtonLink
          href="/dashboard"
          icon={<ArrowRight aria-hidden className="h-4 w-4" />}
        >
          Open Dashboard
        </PrimaryButtonLink>
      </div>
    </section>
  );
}
