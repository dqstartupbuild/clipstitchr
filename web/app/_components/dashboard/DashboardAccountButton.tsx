"use client";

import dynamic from "next/dynamic";

export const DashboardAccountButton = dynamic(
  () => import("@clerk/nextjs").then((module) => module.UserButton),
  { ssr: false },
);
