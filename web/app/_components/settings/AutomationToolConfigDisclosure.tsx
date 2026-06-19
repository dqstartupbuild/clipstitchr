"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type AutomationToolConfigDisclosureProps = {
  children: ReactNode;
  disabled: boolean;
  label: string;
};

export function AutomationToolConfigDisclosure({
  children,
  disabled,
  label,
}: AutomationToolConfigDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? ChevronDown : ChevronRight;

  return (
    <div className="grid gap-3 border-t border-border pt-4">
      <button
        type="button"
        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <Icon aria-hidden className="h-4 w-4 text-accent" />
        {label}
      </button>
      {isOpen ? <div className="grid gap-5">{children}</div> : null}
    </div>
  );
}
