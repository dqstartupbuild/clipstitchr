import { PenLine } from "lucide-react";
import { cliprScriptIdeaMaxLength } from "@/lib/clipstitchr/constants/cliprScriptIdeaMaxLength";

type CliprScriptIdeaPanelProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CliprScriptIdeaPanel({
  value,
  onChange,
}: CliprScriptIdeaPanelProps) {
  return (
    <section className="lg:col-span-2">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <PenLine aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Script</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Idea
          </h2>
        </div>
      </div>
      <textarea
        value={value}
        maxLength={cliprScriptIdeaMaxLength}
        rows={5}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
        placeholder="A founder admits the mistake that made launch content feel harder than the launch itself."
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </section>
  );
}
