import type { ComponentPropsWithoutRef } from "react";

export function MdxTable({
  className,
  ...props
}: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table {...props} className={`w-full text-sm ${className ?? ""}`} />
    </div>
  );
}
