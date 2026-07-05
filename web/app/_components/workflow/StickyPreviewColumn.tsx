import type { ReactNode } from "react";

type StickyPreviewColumnProps = {
  children: ReactNode;
  className?: string;
  variant?: "sticky" | "editor";
};

export function StickyPreviewColumn({
  children,
  className = "",
  variant = "sticky",
}: StickyPreviewColumnProps) {
  const baseClassName =
    variant === "editor"
      ? "min-h-0 w-full overflow-y-auto border-t border-border bg-slate-50 p-3 lg:border-l lg:border-t-0"
      : "min-w-0 w-full max-w-[340px] justify-self-center xl:sticky xl:top-5 xl:justify-self-end";

  return (
    <div
      className={[
        baseClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
