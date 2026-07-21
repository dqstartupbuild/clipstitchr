import { Button } from "@/app/_components/ui/Button";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";
import { HookLabRelatedTemplateCard } from "./HookLabRelatedTemplateCard";

export function HookLabRelatedTemplatesSection({
  isLoading,
  templates,
  onUseFormat,
}: {
  isLoading: boolean;
  templates: HookLibraryTemplateSummary[];
  onUseFormat: () => void;
}) {
  return (
    <section aria-labelledby="hook-lab-related-hooks">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3
            className="text-xl font-bold text-text-primary"
            id="hook-lab-related-hooks"
          >
            Hooks with a similar job
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            These library patterns match the opening intent. They are starting
            points, not source-post copy.
          </p>
        </div>
        <Button
          type="button"
          onClick={onUseFormat}
        >
          Use this format
        </Button>
      </div>
      {isLoading ? (
        <p className="mt-5 text-sm text-text-secondary">Finding related hooks…</p>
      ) : templates.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <HookLabRelatedTemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-text-secondary">
          No related library hooks are available yet.
        </p>
      )}
    </section>
  );
}
