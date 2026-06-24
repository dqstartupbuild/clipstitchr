import type { ComponentPropsWithoutRef } from "react";

export function MdxFigcaption({
  className,
  ...props
}: ComponentPropsWithoutRef<"figcaption">) {
  return (
    <figcaption
      {...props}
      className={`px-4 py-3 text-sm text-text-tertiary ${className ?? ""}`}
    />
  );
}
