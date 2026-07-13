import Link from "next/link";
import { Clock3 } from "lucide-react";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

type ResourceHeroProps = {
  estimatedMinutes?: number;
  resourceKey: PublicToolKey;
};

export function ResourceHero({
  estimatedMinutes,
  resourceKey,
}: ResourceHeroProps) {
  const resource = publicToolCatalog[resourceKey];

  return (
    <header className="marketing-grid-bg px-6 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <Link
          className="text-sm font-bold text-accent-dark underline"
          href="/tools"
        >
          Free app marketing library
        </Link>
        <p className="marketing-eyebrow mt-8">{resource.eyebrow}</p>
        <h1 className="marketing-heading mt-5 text-5xl text-text-primary md:text-7xl">
          {resource.name}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
          {resource.description}
        </p>
        {estimatedMinutes ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary">
            <Clock3 aria-hidden className="h-4 w-4 text-accent-dark" />
            About {estimatedMinutes} minutes
          </p>
        ) : null}
      </div>
    </header>
  );
}
