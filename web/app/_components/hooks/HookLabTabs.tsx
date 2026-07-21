import type { HookLabTab } from "@/lib/clipstitchr/types/HookLabTab";

export function HookLabTabs({
  activeTab,
  onChange,
}: {
  activeTab: HookLabTab;
  onChange: (tab: HookLabTab) => void;
}) {
  return (
    <div
      aria-label="Hook Lab views"
      className="grid max-w-xl grid-cols-2 gap-1 rounded-lg bg-surface p-1"
      role="tablist"
    >
      <button
        id="hook-lab-analysis-tab"
        aria-selected={activeTab === "analysis"}
        className={`min-h-11 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          activeTab === "analysis"
            ? "bg-surface-elevated text-accent-dark"
            : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        }`}
        role="tab"
        type="button"
        onClick={() => onChange("analysis")}
      >
        Analyze posts
      </button>
      <button
        id="hook-lab-library-tab"
        aria-selected={activeTab === "library"}
        className={`min-h-11 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          activeTab === "library"
            ? "bg-surface-elevated text-accent-dark"
            : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        }`}
        role="tab"
        type="button"
        onClick={() => onChange("library")}
      >
        Hook library
      </button>
    </div>
  );
}
