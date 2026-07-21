import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";
import { HookLibraryTemplateCard } from "./HookLibraryTemplateCard";

export function HookLibraryGrid({
  isLoading,
  items,
}: {
  isLoading: boolean;
  items: HookLibraryTemplateSummary[];
}) {
  if (isLoading && !items.length) {
    return (
      <div
        aria-label="Loading hook templates"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="min-h-64 animate-pulse rounded-lg bg-[#e3ebe6]"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-lg bg-[#e3ebe6] px-5 py-12 text-center">
        <h2 className="text-xl font-bold text-[#18201c]">No hooks match</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#56625c]">
          Try a broader search or clear one of the filters.
        </p>
      </div>
    );
  }

  return (
    <div
      aria-busy={isLoading || undefined}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {items.map((template) => (
        <HookLibraryTemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
