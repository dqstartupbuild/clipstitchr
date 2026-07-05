import type { ReactNode } from "react";

type WorkflowLayoutProps = {
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "page" | "editor";
};

export function WorkflowLayout({
  aside,
  children,
  className = "",
  contentClassName = "",
  variant = "page",
}: WorkflowLayoutProps) {
  const columnClassName = aside
    ? variant === "editor"
      ? "lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]"
      : "xl:grid-cols-[minmax(0,1fr)_340px]"
    : "xl:grid-cols-1";
  const rowClassName =
    variant === "editor" && aside
      ? "grid-rows-[minmax(0,1fr)_minmax(180px,38dvh)] lg:grid-rows-1"
      : "";
  const layoutClassName =
    variant === "editor"
      ? "grid min-h-0 overflow-hidden rounded-lg border border-border bg-surface shadow-sm"
      : "grid gap-5 xl:items-start";
  const mainClassName =
    variant === "editor"
      ? "min-h-0 min-w-0 overflow-y-auto p-3"
      : "min-w-0";

  return (
    <div
      className={[
        layoutClassName,
        columnClassName,
        rowClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={[mainClassName, contentClassName].filter(Boolean).join(" ")}>
        {children}
      </div>
      {aside}
    </div>
  );
}
