"use client";

import { useMemo, useState } from "react";
import { PublicToolIcon } from "@/app/_components/tools/PublicToolIcon";
import { ToolIndexCard } from "@/app/_components/tools/ToolIndexCard";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

const categoryLabels = {
  all: "All categories",
  business: "Business",
  hooks: "Hooks",
  learning: "Learning",
  planning: "Planning",
  production: "Production",
  testing: "Testing",
  video: "Video",
} as const;

export function ToolsIndexLibrary() {
  const [category, setCategory] = useState<keyof typeof categoryLabels>("all");
  const [query, setQuery] = useState("");
  const visibleTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return publicToolKeys
      .map((key) => publicToolCatalog[key])
      .filter((tool) => {
        const matchesCategory =
          category === "all" || tool.category === category;
        const searchable = [
          tool.name,
          tool.description,
          tool.eyebrow,
          tool.category,
          tool.format,
          ...tool.keywords,
        ]
          .join(" ")
          .toLocaleLowerCase();

        return (
          matchesCategory &&
          (!normalizedQuery || searchable.includes(normalizedQuery))
        );
      });
  }, [category, query]);

  return (
    <section className="mt-12" aria-label="App marketing tools">
      <div className="marketing-card grid gap-4 p-5 md:grid-cols-2 md:p-6">
        <label className="grid gap-2 text-sm font-semibold text-text-primary">
          Search all 50 resources
          <input
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-accent"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Try hooks, UGC, video, budget, or calendar"
            type="search"
            value={query}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-text-primary">
          Category
          <select
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-accent"
            onChange={(event) =>
              setCategory(
                event.currentTarget.value as keyof typeof categoryLabels,
              )
            }
            value={category}
          >
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p
        className="mt-5 text-sm font-semibold text-text-secondary"
        role="status"
      >
        Showing {visibleTools.length} of {publicToolKeys.length}
      </p>
      {visibleTools.length ? (
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {visibleTools.map((tool) => (
            <ToolIndexCard
              description={tool.description}
              eyebrow={`${tool.eyebrow} · ${tool.format}`}
              href={tool.pathname}
              icon={<PublicToolIcon iconKey={tool.iconKey} />}
              key={tool.key}
              title={tool.name}
            />
          ))}
        </div>
      ) : (
        <p className="marketing-card mt-5 p-6 text-text-secondary">
          No resource matches that search yet. Try a shorter phrase or another
          category.
        </p>
      )}
    </section>
  );
}
