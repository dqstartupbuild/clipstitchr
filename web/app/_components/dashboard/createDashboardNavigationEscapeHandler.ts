import type { Dispatch, SetStateAction } from "react";

export function createDashboardNavigationEscapeHandler(
  setIsOpen: Dispatch<SetStateAction<boolean>>,
) {
  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };
}
