import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Panel({ children, className = "", ...props }: PanelProps) {
  return (
    <div
      className={[
        "min-w-0 rounded-lg border border-border bg-surface shadow-sm shadow-slate-200/60",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
