import type { ReactNode } from "react";

type WorkflowPageFrameProps = {
  children: ReactNode;
  className?: string;
};

export function WorkflowPageFrame({
  children,
  className = "",
}: WorkflowPageFrameProps) {
  return (
    <div
      className={[
        "mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
