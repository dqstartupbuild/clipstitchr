"use client";

import { createContext } from "react";
import type { DashboardLibraryContextValue } from "@/lib/clipstitchr/types/DashboardLibraryContextValue";

export const DashboardLibraryContext =
  createContext<DashboardLibraryContextValue | null>(null);
