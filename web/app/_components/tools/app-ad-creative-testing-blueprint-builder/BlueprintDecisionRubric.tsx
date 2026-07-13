import type { BlueprintDecisionRule } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintDecisionRule";

type BlueprintDecisionRubricProps = {
  rules: BlueprintDecisionRule[];
};

export function BlueprintDecisionRubric({
  rules,
}: BlueprintDecisionRubricProps) {
  return (
    <section className="rounded-xl border border-border bg-surface-elevated p-5">
      <h3 className="text-base font-bold text-text-primary">Decision rubric</h3>
      <div className="mt-4 grid gap-3">
        {rules.map((rule) => (
          <article
            className="rounded-lg border border-border bg-surface p-4"
            key={rule.outcome}
          >
            <h4 className="text-sm font-bold text-text-primary">
              {rule.label}
            </h4>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {rule.condition}
            </p>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Next: {rule.nextAction}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
