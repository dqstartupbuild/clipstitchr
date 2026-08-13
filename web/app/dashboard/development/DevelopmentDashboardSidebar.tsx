"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { BrandMark } from "@/app/_components/BrandMark";
import { useDashboardNavigationFocus } from "@/app/_components/dashboard/useDashboardNavigationFocus";
import { DevelopmentAccountSummary } from "@/app/dashboard/development/DevelopmentAccountSummary";
import { developmentDashboardNavigation } from "@/lib/clipstitchr/development/fixtures/developmentDashboardNavigation";

export function DevelopmentDashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useDashboardNavigationFocus(
    isOpen,
    setIsOpen,
    openButtonRef,
    closeButtonRef,
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface px-4 py-3 lg:hidden">
        <BrandMark />
        <button
          aria-controls="development-dashboard-navigation"
          aria-expanded={isOpen}
          type="button"
          aria-label="Open navigation"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-surface-muted text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={() => setIsOpen(true)}
          ref={openButtonRef}
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>
      </header>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          tabIndex={-1}
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[86vw] flex-col bg-surface px-4 py-4 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0",
          isOpen
            ? "visible translate-x-0"
            : "invisible -translate-x-full lg:visible",
        ].join(" ")}
        id="development-dashboard-navigation"
      >
        <div className="flex items-center justify-between">
          <BrandMark />
          <button
            type="button"
            aria-label="Close navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-surface-muted text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            onClick={() => setIsOpen(false)}
            ref={closeButtonRef}
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-6 px-3 text-xs font-bold text-text-tertiary">
          Local workspace
        </p>
        <nav className="mt-2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {developmentDashboardNavigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  isActive
                    ? "bg-surface-muted text-text-primary"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                ].join(" ")}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <DevelopmentAccountSummary />
      </aside>
    </>
  );
}
