"use client";

import { useEffect, useMemo, useState } from "react";
import { GuidedResourcePortabilityActions } from "@/app/_components/tools/resources/GuidedResourcePortabilityActions";
import { GuidedResourceSectionCard } from "@/app/_components/tools/resources/GuidedResourceSectionCard";
import { CourseLockedSectionCard } from "@/app/_components/tools/resources/CourseLockedSectionCard";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import { usePublicToolBrowserUnlock } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock";
import type { CourseLockedSection } from "@/lib/clipstitchr/tools/courses/CourseLockedSection";
import type { CourseWorkspaceState } from "@/lib/clipstitchr/tools/courses/CourseWorkspaceState";
import { isCourseKey } from "@/lib/clipstitchr/tools/courses/isCourseKey";
import { useCourseProgressSync } from "@/lib/clipstitchr/tools/courses/useCourseProgressSync";
import { createGuidedResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createGuidedResourceMarkdown";
import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";
import type { GuidedResourceNotes } from "@/lib/clipstitchr/tools/resources/GuidedResourceNotes";

type GuidedResourceWorkspaceProps = {
  courseWorkspaceState?: CourseWorkspaceState;
  definition: GuidedResourceDefinition;
  isEmailNativeEnrolled?: boolean;
  isEmailNativeGateActive?: boolean;
  lockedSections?: readonly CourseLockedSection[];
  totalItemCount?: number;
  variant?: PublicToolGateVariant;
};

export function GuidedResourceWorkspace({
  courseWorkspaceState,
  definition,
  isEmailNativeEnrolled = false,
  isEmailNativeGateActive = false,
  lockedSections = [],
  totalItemCount,
  variant = "control",
}: GuidedResourceWorkspaceProps) {
  const isBrowserUnlocked = usePublicToolBrowserUnlock();
  const courseKey = isCourseKey(definition.resourceKey)
    ? definition.resourceKey
    : null;
  const hasSyncedCourseAccess = courseWorkspaceState?.hasAccess === true;
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () =>
      new Set(
        courseWorkspaceState?.progressItems
          .filter((item) => item.completed)
          .map((item) => item.itemId) ?? [],
      ),
  );
  const [hasLoadedProgress, setHasLoadedProgress] = useState(
    hasSyncedCourseAccess || !definition.progressStorageKey,
  );
  const [notes, setNotes] = useState<GuidedResourceNotes>(() =>
    Object.fromEntries(
      courseWorkspaceState?.progressItems.map((item) => [
        item.itemId,
        item.note,
      ]) ?? [],
    ),
  );
  const courseSync = useCourseProgressSync(courseKey, hasSyncedCourseAccess);
  const visibleItemCount = definition.sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  const itemCount = totalItemCount ?? visibleItemCount;

  useEffect(() => {
    if (!definition.progressStorageKey || hasSyncedCourseAccess) return;
    const timeoutId = window.setTimeout(() => {
      const saved = window.localStorage.getItem(definition.progressStorageKey!);

      if (saved) {
        try {
          const parsed = JSON.parse(saved) as {
            completedIds?: string[];
            notes?: GuidedResourceNotes;
          };
          const visibleIds = new Set(
            definition.sections.flatMap((section) =>
              section.items.map((item) => item.id),
            ),
          );
          setCompletedIds(
            new Set(
              (parsed.completedIds ?? []).filter((itemId) =>
                visibleIds.has(itemId),
              ),
            ),
          );
          setNotes(
            Object.fromEntries(
              Object.entries(parsed.notes ?? {}).filter(([itemId]) =>
                visibleIds.has(itemId),
              ),
            ),
          );
        } catch {
          window.localStorage.removeItem(definition.progressStorageKey!);
        }
      }

      setHasLoadedProgress(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [definition, definition.progressStorageKey, hasSyncedCourseAccess]);

  useEffect(() => {
    if (
      !definition.progressStorageKey ||
      !hasLoadedProgress ||
      hasSyncedCourseAccess
    ) {
      return;
    }
    window.localStorage.setItem(
      definition.progressStorageKey,
      JSON.stringify({ completedIds: Array.from(completedIds), notes }),
    );
  }, [
    completedIds,
    definition.progressStorageKey,
    hasLoadedProgress,
    hasSyncedCourseAccess,
    notes,
  ]);

  const markdown = useMemo(
    () => createGuidedResourceMarkdown(definition, completedIds, notes),
    [completedIds, definition, notes],
  );
  const progress =
    itemCount > 0 ? Math.round((completedIds.size / itemCount) * 100) : 0;
  const hasEmailNativeAccess =
    isEmailNativeGateActive && courseKey
      ? courseWorkspaceState?.hasAccess === true
      : isEmailNativeEnrolled || isBrowserUnlocked;
  const canUsePortableActions =
    !isEmailNativeGateActive || hasEmailNativeAccess;
  const visibleSections = definition.sections;

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
            {hasSyncedCourseAccess ? (
              <p
                className="mt-1 text-xs font-semibold text-text-tertiary"
                role="status"
              >
                {courseSync.status === "saving"
                  ? "Saving across your devices..."
                  : courseSync.status === "error"
                    ? "We could not sync that change. Try it again."
                    : "Progress is saved across your devices."}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {canUsePortableActions ? (
              <GuidedResourcePortabilityActions
                definition={definition}
                markdown={markdown}
                variant={variant}
              />
            ) : null}
            <button
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-bold text-text-secondary hover:border-accent"
              onClick={() => {
                setCompletedIds(new Set());
                setNotes({});
                void courseSync.reset();
              }}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-6">
          {visibleSections.map((section) => (
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
                courseSync.saveItem(
                  itemId,
                  completed,
                  notes[itemId] ?? "",
                  true,
                );
              }}
              onNoteChange={(itemId, note) => {
                setNotes((current) => ({ ...current, [itemId]: note }));
                courseSync.saveItem(
                  itemId,
                  completedIds.has(itemId),
                  note,
                );
              }}
              section={section}
            />
          ))}
          {lockedSections.map((section) => (
            <CourseLockedSectionCard key={section.id} section={section} />
          ))}
        </div>
      </div>
    </section>
  );
}
