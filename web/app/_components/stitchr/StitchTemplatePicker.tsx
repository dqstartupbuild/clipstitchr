"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";

type StitchTemplatePickerProps = {
  isLoading: boolean;
  selectedTemplateId: string;
  templates: StitchTemplate[];
  onTemplateChange: (templateId: string) => void;
};

export function StitchTemplatePicker({
  isLoading,
  selectedTemplateId,
  templates,
  onTemplateChange,
}: StitchTemplatePickerProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <SelectInput
        label="Template"
        value={selectedTemplateId}
        disabled={isLoading}
        options={[
          { label: "None", value: "" },
          ...templates.map((template) => ({
            label: template.name,
            value: template.id,
          })),
        ]}
        onChange={(event) => onTemplateChange(event.currentTarget.value)}
      />
    </div>
  );
}
