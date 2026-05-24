import { Clapperboard } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { cliprContentTypeOptions } from "@/lib/clipstitchr/constants/cliprContentTypeOptions";
import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";

type CliprContentTypeSelectProps = {
  value: CliprContentType;
  onChange: (contentType: CliprContentType) => void;
};

export function CliprContentTypeSelect({
  value,
  onChange,
}: CliprContentTypeSelectProps) {
  const selectedOption =
    cliprContentTypeOptions.find((option) => option.id === value) ??
    cliprContentTypeOptions[0];

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Clapperboard aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Format</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Content type
          </h2>
        </div>
      </div>
      <SelectInput
        label="Clip format"
        options={cliprContentTypeOptions.map((option) => ({
          label: option.label,
          value: option.id,
        }))}
        value={value}
        onChange={(event) => onChange(event.target.value as CliprContentType)}
      />
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {selectedOption.description}
      </p>
    </section>
  );
}
