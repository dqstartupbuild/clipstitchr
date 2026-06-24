import type { ComponentPropsWithoutRef } from "react";

export function MdxFigure({
  className,
  ...props
}: ComponentPropsWithoutRef<"figure">) {
  return (
    <figure
      {...props}
      className={`my-10 overflow-hidden rounded-lg border border-border bg-surface ${className ?? ""}`}
    />
  );
}
