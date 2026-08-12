import type { ReactNode } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import type { DevelopmentFixtureState } from "@/lib/clipstitchr/development/types/DevelopmentFixtureState";

type DevelopmentFixtureContentProps = {
  children: ReactNode;
  emptyDescription: string;
  emptyTitle: string;
  errorMessage: string;
  state: DevelopmentFixtureState;
};

export function DevelopmentFixtureContent({
  children,
  emptyDescription,
  emptyTitle,
  errorMessage,
  state,
}: DevelopmentFixtureContentProps) {
  if (state === "loading") {
    return (
      <div className="grid gap-3" aria-busy="true" aria-label="Loading preview data">
        {["first", "second", "third"].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-md bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <DashboardEmptyState
        description={emptyDescription}
        title={emptyTitle}
      />
    );
  }

  if (state === "error") {
    return <DashboardAlert variant="error">{errorMessage}</DashboardAlert>;
  }

  return children;
}
