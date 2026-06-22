import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { OnboardingProgressSteps } from "@/app/_components/onboarding/OnboardingProgressSteps";
import type { OnboardingStep } from "@/lib/clipstitchr/types/OnboardingStep";

type OnboardingShellProps = {
  activeStep: OnboardingStep;
  children: ReactNode;
};

export function OnboardingShell({
  activeStep,
  children,
}: OnboardingShellProps) {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="min-w-0">
          <p className="text-sm font-semibold text-accent-dark">
            First batch setup
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-text-primary md:text-3xl">
            Create your first batch of ads
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Add the product, upload UGC and a demo, review the scores, then
            create the first batch of finished stitches.
          </p>
        </header>
        <OnboardingProgressSteps activeStep={activeStep} />
        {children}
      </div>
    </DashboardShell>
  );
}
