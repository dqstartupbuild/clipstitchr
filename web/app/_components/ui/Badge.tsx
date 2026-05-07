import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "purple" | "green" | "slate" | "amber";
};

const toneClasses = {
  purple: "border-purple-200 bg-purple-50 text-accent-dark",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
        toneClasses[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
