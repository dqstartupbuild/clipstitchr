"use client";

import { useMemo, useState } from "react";
import { CollectionResourceCard } from "@/app/_components/tools/resources/CollectionResourceCard";
import { CollectionResourcePortabilityActions } from "@/app/_components/tools/resources/CollectionResourcePortabilityActions";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";
import { createCollectionResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createCollectionResourceMarkdown";
import { filterCollectionResourceItems } from "@/lib/clipstitchr/tools/resources/filterCollectionResourceItems";
import { getCollectionResourceCategories } from "@/lib/clipstitchr/tools/resources/getCollectionResourceCategories";

type CollectionResourceBrowserProps = {
  definition: CollectionResourceDefinition;
  variant?: PublicToolGateVariant;
};

export function CollectionResourceBrowser({
  definition,
  variant = "control",
}: CollectionResourceBrowserProps) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const title = publicToolCatalog[definition.resourceKey].name;
  const categories = useMemo(
    () => ["All", ...getCollectionResourceCategories(definition.items)],
    [definition.items],
  );
  const visibleItems = useMemo(
    () => filterCollectionResourceItems(definition.items, category, query),
    [category, definition.items, query],
  );
  const markdown = useMemo(
    () => createCollectionResourceMarkdown(title, definition),
    [definition, title],
  );

  return (
    <section className="px-6 py-16 md:py-20" aria-label={title}>
      <div className="mx-auto max-w-6xl">
        <div className="marketing-card grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-end md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-text-primary">
              Search
              <input
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-accent"
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder={definition.searchPlaceholder}
                type="search"
                value={query}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-primary">
              Category
              <select
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-accent"
                onChange={(event) => setCategory(event.currentTarget.value)}
                value={category}
              >
                {categories.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
          <CollectionResourcePortabilityActions
            definition={definition}
            markdown={markdown}
            variant={variant}
          />
        </div>
        <p
          className="mt-5 text-sm font-semibold text-text-secondary"
          role="status"
        >
          Showing {visibleItems.length} of {definition.items.length}
        </p>
        {visibleItems.length ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <CollectionResourceCard item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <p className="marketing-card mt-5 p-6 text-text-secondary">
            {definition.emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}
