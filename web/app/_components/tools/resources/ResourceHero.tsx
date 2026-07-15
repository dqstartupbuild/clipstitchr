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
    <header className="public-tool-hero">
      <div>
        <Link className="public-back-link" href="/tools">
          Free app marketing library
        </Link>
        <p className="public-tool-kind">{resource.eyebrow}</p>
        <h1 className="marketing-heading">{resource.name}</h1>
        <p className="public-tool-description">{resource.description}</p>
        {estimatedMinutes ? (
          <p className="public-tool-time">
            <Clock3 aria-hidden />
            About {estimatedMinutes} minutes
          </p>
        ) : null}
      </div>
    </header>
  );
}
