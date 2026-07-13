import { Panel } from "@/app/_components/ui/Panel";

export function AppAdHookRewriterEmptyState() {
  return (
    <Panel className="p-5 md:p-6">
      <p className="marketing-eyebrow">What you will get</p>
      <h2 className="marketing-subheading mt-4 text-3xl text-text-primary">
        Six useful directions, not six tiny word swaps.
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        Each result has a different creative job and a simple note explaining
        when that version is worth testing.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          "Clearer",
          "Shorter",
          "Audience-first",
          "Problem-first",
          "Outcome-led",
          "Pattern break",
        ].map((label) => (
          <p className="rounded-lg border border-border bg-surface-muted p-4 text-sm font-bold text-text-primary" key={label}>
            {label}
          </p>
        ))}
      </div>
    </Panel>
  );
}
