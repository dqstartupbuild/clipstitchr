"use client";

import {
  FlaskConical,
  Home,
  Images,
  Library,
  CirclePlay,
  Menu,
  Scissors,
  Send,
  Settings,
  Shuffle,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/app/_components/BrandMark";
import { DashboardAccountButton } from "@/app/_components/dashboard/DashboardAccountButton";
import { DashboardNotificationBell } from "@/app/_components/dashboard/DashboardNotificationBell";
import { DashboardProductSwitcher } from "@/app/_components/dashboard/DashboardProductSwitcher";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";

const navigationSections = [
  {
    label: "Home base",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/library", label: "Library", icon: Library },
    ],
  },
  {
    label: "Make",
    links: [
      { href: "/dashboard/stitchr", label: "Stitchr", icon: Scissors },
      { href: "/dashboard/clipr", label: "Clipr", icon: CirclePlay },
      { href: "/dashboard/swipr", label: "Swipr", icon: Images },
      { href: "/dashboard/swapr", label: "Swapr", icon: Shuffle },
      { href: "/dashboard/hooks", label: "Hook Lab", icon: FlaskConical },
    ],
  },
  {
    label: "Ship",
    links: [
      { href: "/dashboard/publishing", label: "Publishing", icon: Send },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { requiresOnboarding } = useDashboardProduct();

  return (
    <>
      <header className="dashboard-mobile-header sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 lg:hidden">
        <BrandMark />
        <div className="flex items-center gap-2">
          <DashboardNotificationBell />
          <span className="dashboard-account-button inline-flex h-8 w-8 shrink-0 items-center justify-center">
            <DashboardAccountButton />
          </span>
          <button
            type="button"
            aria-label="Open navigation"
            className="dashboard-sidebar-control inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-muted text-text-primary transition-colors hover:border-border-hover hover:text-accent-dark"
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
          "dashboard-sidebar fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-border bg-surface/95 px-4 py-4 shadow-2xl shadow-black/35 transition-transform duration-200 lg:sticky lg:inset-auto lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <BrandMark />
          <button
            type="button"
            aria-label="Close navigation"
            className="dashboard-sidebar-control inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-muted text-text-primary transition-colors hover:border-border-hover hover:text-accent-dark lg:hidden"
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
        <nav className="dashboard-sidebar-nav mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {requiresOnboarding ? (
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-3 text-sm font-semibold leading-6 text-text-secondary">
              Finish your first set of ads to open the rest of ClipStitchr.
            </p>
          ) : navigationSections.map((section) => (
            <div key={section.label} className="dashboard-sidebar-section grid gap-1">
              <p className="dashboard-sidebar-label px-3 pt-3 text-[11px] font-bold uppercase text-text-tertiary">
                {section.label}
              </p>
              {section.links.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "dashboard-sidebar-link inline-flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "dashboard-sidebar-link-active border-border-hover bg-surface-muted text-accent-dark"
                        : "border-transparent text-text-secondary hover:border-border hover:bg-surface-muted hover:text-accent-dark",
                    ].join(" ")}
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
            </div>
          ))}
        </nav>
        <div className="dashboard-sidebar-account mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface-muted px-3 py-3 text-sm font-semibold text-text-secondary">
          <span className="dashboard-account-button inline-flex h-8 w-8 shrink-0 items-center justify-center">
            <DashboardAccountButton />
          </span>
          Account
        </div>
      </aside>
    </>
  );
}
