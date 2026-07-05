"use client";

import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { StitchTemplateCard } from "@/app/_components/templates/StitchTemplateCard";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";

type TemplateLibraryTabSectionProps = {
  deletingTemplateId: string | null;
  error: string | null;
  isLoading: boolean;
  savingTemplateId: string | null;
  searchQuery: string;
  templates: StitchTemplate[];
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
};

export function TemplateLibraryTabSection({
  deletingTemplateId,
  error,
  isLoading,
  savingTemplateId,
  searchQuery,
  templates,
  onDelete,
  onRename,
}: TemplateLibraryTabSectionProps) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleTemplates = normalizedSearchQuery
    ? templates.filter((template) =>
        [
          template.name,
          template.sourceStitchName,
          template.ugcClipName,
          template.demoClipName,
        ].some((value) => value.toLowerCase().includes(normalizedSearchQuery)),
      )
    : templates;
  const hasSearchQuery = normalizedSearchQuery.length > 0;

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-bold text-text-primary">Templates</h2>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
          Keep your best Stitchr setups ready so the next version starts faster.
        </p>
      </div>
      {error ? (
        <DashboardAlert variant="error">{error}</DashboardAlert>
      ) : null}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-surface p-5 text-sm text-text-secondary">
          Loading templates...
        </div>
      ) : visibleTemplates.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTemplates.map((template) => (
            <StitchTemplateCard
              key={template.id}
              template={template}
              isDeleting={deletingTemplateId === template.id}
              isSaving={savingTemplateId === template.id}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title={hasSearchQuery ? "No matching templates" : "No templates yet"}
          description={
            hasSearchQuery
              ? "No saved templates match that search."
              : "Save a finished stitch as a template when you want to reuse its setup."
          }
        />
      )}
    </div>
  );
}
