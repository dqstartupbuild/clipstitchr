"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyTextButtonProps = {
  text: string;
  label: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyTextButton({
  text,
  label,
  copiedLabel = "Copied",
  className = "",
}: CopyTextButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 1600);
  };
  const Icon = hasCopied ? Check : Copy;

  return (
    <button
      type="button"
      className={[
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-bold text-text-primary transition-colors hover:border-accent hover:bg-surface-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      ].join(" ")}
      onClick={handleCopy}
    >
      <Icon aria-hidden className="h-4 w-4" />
      {hasCopied ? copiedLabel : label}
    </button>
  );
}
