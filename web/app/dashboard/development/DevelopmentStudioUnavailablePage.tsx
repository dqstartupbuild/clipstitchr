"use client";

import Link from "next/link";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";

export function DevelopmentStudioUnavailablePage() {
  return (
    <DevelopmentDashboardShell>
      <section className="mx-auto max-w-2xl py-12" aria-labelledby="studio-unavailable">
        <h1
          id="studio-unavailable"
          className="text-3xl font-bold text-text-primary"
        >
          Studio is not available in preview mode
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          Sign in with an invited account to use Studio Beta. Preview mode stays
          read-only and cannot open private Studio work.
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-foreground px-5 py-2.5 font-bold text-background transition-colors hover:bg-text-secondary"
        >
          Back to dashboard
        </Link>
      </section>
    </DevelopmentDashboardShell>
  );
}
