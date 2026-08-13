"use client";

import { useEffect, useRef } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { createDashboardNavigationEscapeHandler } from "@/app/_components/dashboard/createDashboardNavigationEscapeHandler";

export function useDashboardNavigationFocus(
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
  openButtonRef: RefObject<HTMLButtonElement | null>,
  closeButtonRef: RefObject<HTMLButtonElement | null>,
) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();

      const closeOnEscape = createDashboardNavigationEscapeHandler(setIsOpen);

      document.addEventListener("keydown", closeOnEscape);
      wasOpenRef.current = true;
      return () => document.removeEventListener("keydown", closeOnEscape);
    }

    if (wasOpenRef.current) {
      openButtonRef.current?.focus();
    }
    wasOpenRef.current = false;
  }, [closeButtonRef, isOpen, openButtonRef, setIsOpen]);
}
