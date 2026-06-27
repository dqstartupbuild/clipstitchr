"use client";

import { UserButton } from "@clerk/nextjs";
import {
  CalendarClock,
  FlaskConical,
  Home,
  Images,
  Library,
  BarChart3,
  CirclePlay,
  Menu,
  Scissors,
  Settings,
  Shuffle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/app/_components/BrandMark";
import { DashboardNotificationBell } from "@/app/_components/dashboard/DashboardNotificationBell";
import { DashboardProductSwitcher } from "@/app/_components/dashboard/DashboardProductSwitcher";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/stitchr", label: "Stitchr", icon: Scissors },
  { href: "/dashboard/clipr", label: "Clipr", icon: CirclePlay },
  { href: "/dashboard/swipr", label: "Swipr", icon: Images },
  { href: "/dashboard/swapr", label: "Swapr", icon: Shuffle },
  { href: "/dashboard/hooks", label: "Hook Lab", icon: FlaskConical },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarClock },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { requiresOnboarding } = useDashboardProduct();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <BrandMark />
        <div className="flex items-center gap-2">
          <DashboardNotificationBell />
          <UserButton />
          <button
            type="button"
            aria-label="Open navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-primary transition-colors hover:bg-surface-muted"
            onClick={() => setIsOpen(true)}
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </header>

      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-border bg-surface px-4 py-4 shadow-xl transition-transform duration-200 lg:sticky lg:inset-auto lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <BrandMark />
          <button
            type="button"
            aria-label="Close navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-primary transition-colors hover:bg-surface-muted lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
        {requiresOnboarding ? null : (
          <div className="mt-5">
            <DashboardProductSwitcher />
          </div>
        )}
        <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {requiresOnboarding ? (
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold leading-6 text-text-secondary">
              Finish your first batch to unlock the workspace.
            </p>
          ) : links.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-accent"
                onClick={() => {
                  trackPostHogEvent("dashboard_navigation_clicked", {
                    destination: item.href,
                    label: item.label,
                  });
                  setIsOpen(false);
                }}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-sm font-semibold text-text-secondary">
          <UserButton />
          Account
        </div>
      </aside>
    </>
  );
}
