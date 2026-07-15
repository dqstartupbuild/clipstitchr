import { ToolDiscoveryCard } from "@/app/_components/tools/ToolDiscoveryCard";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

type ToolDiscoveryLinksProps = {
  currentToolKey: PublicToolKey;
};

export function ToolDiscoveryLinks({
  currentToolKey,
}: ToolDiscoveryLinksProps) {
  const currentTool = publicToolCatalog[currentToolKey];
  const relatedTools = currentTool.relatedToolKeys.map(
    (relatedKey) => publicToolCatalog[relatedKey],
  );

  return (
    <nav aria-label="More app marketing tools" className="tool-discovery-links">
      <div>
        <p>Keep planning</p>
        <h2 className="marketing-heading">
          Take the next step with another free tool.
        </h2>
        <div className="tool-discovery-grid">
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
