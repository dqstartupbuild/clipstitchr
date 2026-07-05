import type { ReactNode } from "react";

type StickyPreviewColumnProps = {
  children: ReactNode;
  className?: string;
};

export function StickyPreviewColumn({
  children,
  className = "",
}: StickyPreviewColumnProps) {
  return (
    <div
      className={[
        "min-w-0 w-full max-w-[340px] justify-self-center xl:sticky xl:top-5 xl:justify-self-end",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
