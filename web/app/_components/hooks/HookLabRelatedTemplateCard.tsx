import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";

export function HookLabRelatedTemplateCard({
  template,
}: {
  template: HookLibraryTemplateSummary;
}) {
  return (
    <article className="rounded-lg bg-surface-muted p-4">
      <p className="text-sm font-semibold text-accent-dark">
        {template.categoryName}
      </p>
      <p className="mt-3 text-sm font-semibold leading-6 text-text-primary">
        {template.template}
      </p>
      <p className="mt-3 text-xs leading-5 text-text-secondary">
        Best for {template.bestFor.slice(0, 2).join(" and ")}.
      </p>
    </article>
  );
}
