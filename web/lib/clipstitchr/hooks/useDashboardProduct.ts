"use client";

import { useContext } from "react";
import { DashboardProductContext } from "@/lib/clipstitchr/context/DashboardProductContext";

export function useDashboardProduct() {
  const value = useContext(DashboardProductContext);

  if (!value) {
    throw new Error(
      "useDashboardProduct must be used inside DashboardProductProvider.",
    );
  }

  return value;
}
