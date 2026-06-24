import type { ComponentPropsWithoutRef } from "react";

export function MdxIframe({
  className,
  ...props
}: ComponentPropsWithoutRef<"iframe">) {
  return (
    <iframe
      {...props}
      className={`aspect-video w-full rounded-lg border border-border ${className ?? ""}`}
      loading={props.loading ?? "lazy"}
      referrerPolicy={props.referrerPolicy ?? "strict-origin-when-cross-origin"}
    />
  );
}
