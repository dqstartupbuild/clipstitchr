import { ArrowRight } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";

export function CreateVideoCallout() {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface-muted p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Ready to create a new video?
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Select a UGC clip and a demo video to get started.
          </p>
        </div>
      </div>
      <PrimaryButtonLink
        href="/dashboard/create"
        icon={<ArrowRight aria-hidden className="h-4 w-4" />}
      >
        Create Video
      </PrimaryButtonLink>
    </section>
  );
}
