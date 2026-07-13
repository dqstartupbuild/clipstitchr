import { ArrowDown, ArrowUp } from "lucide-react";
import type { ClipNamingToken } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingToken";
import { clipNamingTokenLabels } from "@/lib/clipstitchr/tools/clipNamingSystem/clipNamingTokenLabels";

type ClipNamingTokenOrderProps = {
  onChange: (value: readonly ClipNamingToken[]) => void;
  value: readonly ClipNamingToken[];
};

export function ClipNamingTokenOrder({
  onChange,
  value,
}: ClipNamingTokenOrderProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-text-primary">
        Filename order
      </legend>
      <p className="mt-1 text-xs leading-5 text-text-tertiary">
        Move the details your team scans first toward the top.
      </p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {value.map((token, index) => (
          <li
            key={token}
            className="flex items-center justify-between rounded-lg border border-border bg-slate-50 px-3 py-2"
          >
            <span className="text-sm font-bold text-text-primary">
              {index + 1}. {clipNamingTokenLabels[token]}
            </span>
            <span className="flex gap-1">
              <button
                type="button"
                aria-label={`Move ${clipNamingTokenLabels[token]} earlier`}
                disabled={index === 0}
                className="rounded border border-border p-2 text-text-secondary disabled:opacity-30"
                onClick={() => {
                  const next = [...value];
                  [next[index - 1], next[index]] = [
                    next[index],
                    next[index - 1],
                  ];
                  onChange(next);
                }}
              >
                <ArrowUp aria-hidden className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Move ${clipNamingTokenLabels[token]} later`}
                disabled={index === value.length - 1}
                className="rounded border border-border p-2 text-text-secondary disabled:opacity-30"
                onClick={() => {
                  const next = [...value];
                  [next[index], next[index + 1]] = [
                    next[index + 1],
                    next[index],
                  ];
                  onChange(next);
                }}
              >
                <ArrowDown aria-hidden className="h-4 w-4" />
              </button>
            </span>
          </li>
        ))}
      </ol>
    </fieldset>
  );
}
