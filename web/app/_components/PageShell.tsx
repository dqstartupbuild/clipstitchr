import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main className={["mx-auto w-full max-w-6xl px-6", className].join(" ")}>
      {children}
    </main>
  );
}
