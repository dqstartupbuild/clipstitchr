"use client";

import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";

export function CreateVideoHeader() {
  return (
    <DashboardPageHeader
      eyebrow="Studio"
      title="Create Video"
      description="Select one normalized UGC clip and one normalized demo video."
    />
  );
}
