import type { ComponentPropsWithoutRef } from "react";

export function MdxTableHeaderCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      {...props}
      className={`bg-surface px-4 py-3 text-left font-semibold text-text-primary ${className ?? ""}`}
    />
  );
}
