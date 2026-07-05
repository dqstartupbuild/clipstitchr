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
  const columnClassName = aside
    ? "xl:grid-cols-[minmax(0,1fr)_340px]"
    : "xl:grid-cols-1";

  return (
    <div
      className={[
        "grid gap-5 xl:items-start",
        columnClassName,
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
