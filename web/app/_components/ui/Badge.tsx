import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: keyof typeof toneClasses;
};

const toneClasses = {
  purple: "border-purple-200 bg-purple-50 text-accent-dark",
};

export function Badge({ children, tone = "purple" }: BadgeProps) {
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
