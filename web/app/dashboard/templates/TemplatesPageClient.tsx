"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { StitchTemplateCard } from "@/app/_components/templates/StitchTemplateCard";
import { useStitchTemplates } from "@/lib/clipstitchr/hooks/useStitchTemplates";

export function TemplatesPageClient() {
  const stitchTemplates = useStitchTemplates();

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Library"
          title="Templates"
          description="Keep your best Stitchr setups ready so the next version starts faster."
        />
        {stitchTemplates.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {stitchTemplates.error}
          </div>
        ) : null}
        {stitchTemplates.isLoading ? (
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-text-secondary">
            Loading templates...
          </div>
        ) : stitchTemplates.templates.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stitchTemplates.templates.map((template) => (
              <StitchTemplateCard
                key={template.id}
                template={template}
                isDeleting={
                  stitchTemplates.deletingTemplateId === template.id
                }
                isSaving={stitchTemplates.savingTemplateId === template.id}
                onDelete={stitchTemplates.deleteTemplate}
                onRename={stitchTemplates.renameTemplate}
              />
            ))}
          </div>
        ) : (
          <DashboardEmptyState
            title="No templates yet"
            description="Save a finished stitch as a template when you want to reuse its setup."
          />
        )}
      </div>
    </DashboardShell>
  );
}
