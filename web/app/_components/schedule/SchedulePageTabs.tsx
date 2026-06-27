"use client";

import type { SchedulePageTab } from "@/lib/clipstitchr/types/SchedulePageTab";

type SchedulePageTabsProps = {
  value: SchedulePageTab;
  onChange: (tab: SchedulePageTab) => void;
};

const tabs: { label: string; value: SchedulePageTab }[] = [
  { label: "Scheduled content", value: "posts" },
  { label: "Config/accounts", value: "accounts" },
];

export function SchedulePageTabs({ value, onChange }: SchedulePageTabsProps) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-slate-100 p-1"
      aria-label="Schedule page tabs"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
            value === tab.value
              ? "bg-white text-accent shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
