import type { ComponentPropsWithoutRef } from "react";

export function MdxImage({
  alt = "",
  className,
  loading,
  ...props
}: ComponentPropsWithoutRef<"img">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt}
      className={`w-full rounded-lg border border-border ${className ?? ""}`}
      decoding={props.decoding ?? "async"}
      loading={loading ?? "lazy"}
    />
  );
}
