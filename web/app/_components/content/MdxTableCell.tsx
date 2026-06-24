import type { ComponentPropsWithoutRef } from "react";

export function MdxTableCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      {...props}
      className={`border-t border-border px-4 py-3 text-text-secondary ${className ?? ""}`}
    />
  );
}
