"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { GuidedResourceSectionCard } from "@/app/_components/tools/resources/GuidedResourceSectionCard";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import { createGuidedResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createGuidedResourceMarkdown";
import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";
import type { GuidedResourceNotes } from "@/lib/clipstitchr/tools/resources/GuidedResourceNotes";

type GuidedResourceWorkspaceProps = {
  definition: GuidedResourceDefinition;
};

export function GuidedResourceWorkspace({
  definition,
}: GuidedResourceWorkspaceProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [hasLoadedProgress, setHasLoadedProgress] = useState(
    !definition.progressStorageKey,
  );
  const [notes, setNotes] = useState<GuidedResourceNotes>({});
  const itemCount = definition.sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );

  useEffect(() => {
    if (!definition.progressStorageKey) return;
    const timeoutId = window.setTimeout(() => {
      const saved = window.localStorage.getItem(definition.progressStorageKey!);

      if (saved) {
        try {
          const parsed = JSON.parse(saved) as {
            completedIds?: string[];
            notes?: GuidedResourceNotes;
          };
          setCompletedIds(new Set(parsed.completedIds ?? []));
          setNotes(parsed.notes ?? {});
        } catch {
          window.localStorage.removeItem(definition.progressStorageKey!);
        }
      }

      setHasLoadedProgress(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [definition.progressStorageKey]);

  useEffect(() => {
    if (!definition.progressStorageKey || !hasLoadedProgress) return;
    window.localStorage.setItem(
      definition.progressStorageKey,
      JSON.stringify({ completedIds: Array.from(completedIds), notes }),
    );
  }, [completedIds, definition.progressStorageKey, hasLoadedProgress, notes]);

  const markdown = useMemo(
    () => createGuidedResourceMarkdown(definition, completedIds, notes),
    [completedIds, definition, notes],
  );
  const progress =
    itemCount > 0 ? Math.round((completedIds.size / itemCount) * 100) : 0;

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-label={definition.completionLabel}
    >
      <div className="mx-auto max-w-5xl">
        <div className="marketing-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-sm font-bold text-accent-dark">Your progress</p>
            <p className="mt-1 text-2xl font-black text-text-primary">
              {completedIds.size} of {itemCount} complete · {progress}%
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyTextButton label="Copy my resource" text={markdown} />
            <ResourceDownloadButton
              contents={markdown}
              fileName={`${definition.resourceKey}.md`}
              label="Download Markdown"
              type="text/markdown;charset=utf-8"
            />
            <button
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-bold text-text-secondary hover:border-accent"
              onClick={() => {
                setCompletedIds(new Set());
                setNotes({});
              }}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-6">
          {definition.sections.map((section) => (
            <GuidedResourceSectionCard
              completedIds={completedIds}
              key={section.id}
              notes={notes}
              onCompletedChange={(itemId, completed) => {
                setCompletedIds((current) => {
                  const next = new Set(current);
                  if (completed) next.add(itemId);
                  else next.delete(itemId);
                  return next;
                });
              }}
              onNoteChange={(itemId, note) =>
                setNotes((current) => ({ ...current, [itemId]: note }))
              }
              section={section}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
