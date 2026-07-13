import { Panel } from "@/app/_components/ui/Panel";

export function HookVisualMatchmakerEmptyState() {
  return (
    <Panel className="p-5 md:p-6">
      <p className="marketing-eyebrow">What you will get</p>
      <h2 className="marketing-subheading mt-4 text-3xl text-text-primary">
        One connected opening from 0 to 5 seconds.
      </h2>
      <div className="mt-6 grid gap-3">
        {[
          ["0–1.5 sec", "Earn the hook"],
          ["1.5–3 sec", "Keep one idea moving"],
          ["3–5 sec", "Hand off to the product"],
        ].map(([time, label]) => (
          <article className="rounded-lg border border-border bg-surface-muted p-4" key={time}>
            <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">{time}</p>
            <h3 className="mt-2 text-sm font-bold text-text-primary">{label}</h3>
          </article>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-text-secondary">
        If a requested asset is missing, the plan adapts instead of pretending
        the shot exists.
      </p>
    </Panel>
  );
}
