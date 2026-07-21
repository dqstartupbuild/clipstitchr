"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";

export function HookLibraryTemplateCard({
  template,
}: {
  template: HookLibraryTemplateSummary;
}) {
  const [copyLabel, setCopyLabel] = useState("Copy hook");

  return (
    <article className="flex min-h-64 flex-col rounded-lg bg-[#eef3f0] p-5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <p className="font-semibold text-[#344039]">{template.categoryName}</p>
        <p className="text-right text-[#68736d]">{template.emotionalTrigger}</p>
      </div>
      <p className="mt-5 flex-1 whitespace-pre-wrap text-lg font-semibold leading-7 text-[#18201c]">
        {template.template}
      </p>
      <div className="mt-5">
        <p className="text-xs leading-5 text-[#68736d]">
          Best for {template.bestFor.slice(0, 2).join(" and ")}
          {template.requiredVariables.length
            ? `. Fill in ${template.requiredVariables.join(", ")}.`
            : "."}
        </p>
        <Button
          className="mt-3 w-full"
          size="sm"
          type="button"
          variant="subtle"
          onClick={() => {
            void navigator.clipboard
              .writeText(template.template)
              .then(() => setCopyLabel("Copied"))
              .catch(() => setCopyLabel("Copy failed"));
          }}
        >
          {copyLabel}
        </Button>
      </div>
    </article>
  );
}
