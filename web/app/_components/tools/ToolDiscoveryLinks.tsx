import { ToolDiscoveryCard } from "@/app/_components/tools/ToolDiscoveryCard";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

type ToolDiscoveryLinksProps = {
  currentToolKey: PublicToolKey;
};

export function ToolDiscoveryLinks({ currentToolKey }: ToolDiscoveryLinksProps) {
  const currentTool = publicToolCatalog[currentToolKey];
  const relatedTools = currentTool.relatedToolKeys.map(
    (relatedKey) => publicToolCatalog[relatedKey],
  );

  return (
    <nav
      aria-label="More app marketing tools"
      className="bg-surface-muted/45 px-6 py-20 md:py-24"
    >
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">Keep planning</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-5xl">
          Take the next step with another free tool.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {relatedTools.map((tool) => (
            <ToolDiscoveryCard
              description={tool.description}
              eyebrow="Try next"
              href={tool.pathname}
              key={tool.key}
              linkLabel={`Use ${tool.name}`}
              name={tool.name}
            />
          ))}
          <ToolDiscoveryCard
            description="Find every free ClipStitchr calculator, checker, and creative planning resource in one place."
            eyebrow="Tool library"
            href="/tools"
            linkLabel="Browse all tools"
            name="All app marketing tools"
          />
        </div>
      </div>
    </nav>
  );
}
