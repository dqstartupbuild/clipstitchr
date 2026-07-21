"use client";

import { useEffect, useRef } from "react";

const dialogFocusableElementSelector = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "details > summary:first-of-type",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useDialogFocusManagement<
  Element extends HTMLElement = HTMLDivElement,
>(onClose: () => void) {
  const dialogRef = useRef<Element>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;

    const getFocusableElements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(dialogFocusableElementSelector),
      )
        .filter((element) => {
          const style = window.getComputedStyle(element);

          return (
            element.tabIndex >= 0 &&
            !element.hidden &&
            element.getAttribute("aria-hidden") !== "true" &&
            !element.closest("[inert]") &&
            style.display !== "none" &&
            style.visibility !== "hidden"
          );
        })
        .sort((leftElement, rightElement) =>
          leftElement.compareDocumentPosition(rightElement) &
          Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
        );

    const focusFirstElement = () => {
      const [firstFocusableElement] = getFocusableElements();
      (firstFocusableElement ?? dialog).focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements.at(-1);
      const activeElement = document.activeElement;
      const focusIsOutsideDialog =
        !(activeElement instanceof Node) || !dialog.contains(activeElement);

      if (
        event.shiftKey &&
        (activeElement === firstFocusableElement || focusIsOutsideDialog)
      ) {
        event.preventDefault();
        lastFocusableElement?.focus();
        return;
      }

      if (
        !event.shiftKey &&
        (activeElement === lastFocusableElement || focusIsOutsideDialog)
      ) {
        event.preventDefault();
        firstFocusableElement?.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && dialog.contains(event.target)) {
        return;
      }

      focusFirstElement();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    focusFirstElement();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);

      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

  return dialogRef;
}
