"use client";

import { useEffect, useState } from "react";
import { libraryTabChangeEventName } from "@/lib/clipstitchr/constants/libraryTabChangeEventName";
import type { LibraryTab } from "@/lib/clipstitchr/types/LibraryTab";
import { getCurrentLibraryTabFromWindow } from "@/lib/clipstitchr/utils/getCurrentLibraryTabFromWindow";

export function useActiveLibraryTab(): LibraryTab {
  const [activeTab, setActiveTab] = useState<LibraryTab>(
    getCurrentLibraryTabFromWindow,
  );

  useEffect(() => {
    const syncActiveTab = () => {
      setActiveTab(getCurrentLibraryTabFromWindow());
    };

    window.addEventListener("popstate", syncActiveTab);
    window.addEventListener(libraryTabChangeEventName, syncActiveTab);

    return () => {
      window.removeEventListener("popstate", syncActiveTab);
      window.removeEventListener(libraryTabChangeEventName, syncActiveTab);
    };
  }, []);

  return activeTab;
}
