"use client";

import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export type MediaCardActionMenuItem = {
  disabled?: boolean;
  href?: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
};

type MediaCardActionMenuProps = {
  items: MediaCardActionMenuItem[];
  label: string;
};

const menuWidth = 224;
const menuItemHeight = 40;
const viewportPadding = 8;

export function MediaCardActionMenu({
  items,
  label,
}: MediaCardActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const estimatedHeight = Math.min(320, items.length * menuItemHeight + 16);
    const left = Math.max(
      viewportPadding,
      Math.min(
        rect.right - menuWidth,
        window.innerWidth - menuWidth - viewportPadding,
      ),
    );
    const top =
      rect.bottom + estimatedHeight + viewportPadding > window.innerHeight
        ? Math.max(viewportPadding, rect.top - estimatedHeight - 6)
        : rect.bottom + 6;

    setPosition({ left, top });
  }, [items.length]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    const handleViewportChange = () => updatePosition();

    void Promise.resolve().then(updatePosition);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, updatePosition]);

  if (!items.length) {
    return null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={label}
        title={label}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onClick={() => {
          updatePosition();
          setIsOpen((open) => !open);
        }}
      >
        <EllipsisVertical aria-hidden className="h-4 w-4" />
      </button>
      {isOpen ? (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-[80] w-56 overflow-hidden rounded-lg border border-border bg-white py-1 shadow-xl shadow-slate-900/15"
          style={position}
        >
          {items.map((item) =>
            item.href && !item.disabled ? (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-text-tertiary">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={[
                  "flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  item.variant === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                ].join(" ")}
                onClick={() => {
                  if (item.disabled) {
                    return;
                  }

                  setIsOpen(false);
                  item.onClick?.();
                }}
              >
                <span
                  className={
                    item.variant === "danger"
                      ? "text-red-500"
                      : "text-text-tertiary"
                  }
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ),
          )}
        </div>
      ) : null}
    </>
  );
}
