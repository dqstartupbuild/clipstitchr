import { Sparkles } from "lucide-react";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

export function CliprCallout() {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-bold text-text-primary">
          Need more source clips?
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Generate engagement Clips, save them to the library, and reuse them in
          Stitchr.
        </p>
      </div>
      <SecondaryButtonLink
        href="/dashboard/clipr"
        icon={<Sparkles aria-hidden className="h-4 w-4" />}
      >
        Create Clip
      </SecondaryButtonLink>
    </section>
  );
}
