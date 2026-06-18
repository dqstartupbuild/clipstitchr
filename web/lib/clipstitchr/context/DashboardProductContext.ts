"use client";

import { createContext } from "react";
import type { DashboardProductContextValue } from "@/lib/clipstitchr/types/DashboardProductContextValue";

export const DashboardProductContext =
  createContext<DashboardProductContextValue | null>(null);
