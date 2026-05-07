import { ArrowRight } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";

export function CreateVideoCallout() {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-accent-dark p-6 text-white md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-bold">Pair one UGC clip with one demo.</h2>
        <p className="mt-2 text-sm leading-6 text-purple-100">
          The create studio previews UGC first, then starts the demo immediately.
        </p>
      </div>
      <PrimaryButtonLink
        href="/dashboard/create"
        className="bg-white text-accent-dark hover:bg-purple-50"
        icon={<ArrowRight aria-hidden className="h-4 w-4" />}
      >
        Create Video
      </PrimaryButtonLink>
    </section>
  );
}
