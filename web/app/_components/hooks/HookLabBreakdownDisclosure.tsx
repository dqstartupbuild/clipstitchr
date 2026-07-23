import type { ReactNode } from "react";

export function HookLabBreakdownDisclosure({
  children,
  description,
  isOpen = false,
  title,
}: {
  children: ReactNode;
  description: string;
  isOpen?: boolean;
  title: string;
}) {
  return (
    <details className="group rounded-lg bg-surface-muted" open={isOpen}>
      <summary className="cursor-pointer list-none rounded-lg px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-balance text-lg font-bold text-text-primary">
              {title}
            </span>
            <span className="mt-1 block text-pretty text-sm leading-6 text-text-secondary">
              {description}
            </span>
          </span>
          <span
            aria-hidden
            className="shrink-0 text-sm font-semibold text-accent-dark"
          >
            <span className="group-open:hidden">Open</span>
            <span className="hidden group-open:inline">Close</span>
          </span>
        </span>
      </summary>
      <div className="grid gap-8 px-5 pb-6 pt-2 sm:px-6">{children}</div>
    </details>
  );
}
