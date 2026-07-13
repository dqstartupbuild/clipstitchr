import { Eye, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

export function AppAdHookGraderEmptyState() {
  return (
    <Panel className="p-5 md:p-6">
      <p className="marketing-eyebrow">What the grade covers</p>
      <h2 className="marketing-subheading mt-4 text-3xl text-text-primary">
        A useful review, without pretending to know performance.
      </h2>
      <div className="mt-6 grid gap-3">
        {[
          [MessageCircleQuestion, "Words", "Clarity, specificity, audience fit, and curiosity."],
          [Eye, "Handoff", "Whether the first visual can answer the opening."],
          [ShieldCheck, "Proof", "Wording that deserves stronger support or review."],
        ].map(([Icon, title, description]) => {
          const ItemIcon = Icon as typeof Eye;

          return (
            <article className="flex gap-3 rounded-lg border border-border bg-surface-muted p-4" key={String(title)}>
              <ItemIcon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">{String(title)}</h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{String(description)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
