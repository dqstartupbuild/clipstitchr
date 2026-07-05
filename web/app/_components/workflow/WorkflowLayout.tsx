import type { ReactNode } from "react";

type WorkflowLayoutProps = {
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function WorkflowLayout({
  aside,
  children,
  className = "",
}: WorkflowLayoutProps) {
  return (
    <div
      className={[
        "grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start",
        aside ? "" : "xl:grid-cols-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">{children}</div>
      {aside}
    </div>
  );
}
