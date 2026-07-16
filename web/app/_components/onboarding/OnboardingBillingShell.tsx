import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";

type OnboardingBillingShellProps = {
  children: ReactNode;
};

export function OnboardingBillingShell({
  children,
}: OnboardingBillingShellProps) {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="min-w-0">
          <h1 className="text-2xl font-bold tracking-normal text-text-primary md:text-3xl">
            Start with the right amount of room
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Confirm your plan securely with Stripe. Once payment is confirmed,
            you will come right back here to set up your first product and ads.
          </p>
        </header>
        {children}
      </div>
    </DashboardShell>
  );
}
