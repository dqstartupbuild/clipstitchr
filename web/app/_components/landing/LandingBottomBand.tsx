import { ArrowRight } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";

export function LandingBottomBand() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-lg bg-accent-dark p-8 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Create your first ClipStitchr video.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100">
            Upload clips, demos, or photos. Build a stitched ad, create
            a new UGC-style clip, or keep everything organized for the next
            campaign.
          </p>
        </div>
        <PrimaryButtonLink
          href="/dashboard"
          className="bg-white text-accent-dark hover:bg-purple-50"
          icon={<ArrowRight aria-hidden className="h-4 w-4" />}
        >
          Go to Dashboard
        </PrimaryButtonLink>
      </div>
    </section>
  );
}
