"use client";

import { Printer } from "lucide-react";

type ResourcePrintButtonProps = {
  label: string;
};

export function ResourcePrintButton({ label }: ResourcePrintButtonProps) {
  return (
    <button
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-bold text-text-primary transition-colors hover:border-accent hover:bg-surface-elevated"
      onClick={() => window.print()}
      type="button"
    >
      <Printer aria-hidden className="h-4 w-4" />
      {label}
    </button>
  );
}
