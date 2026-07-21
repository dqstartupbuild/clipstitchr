export function HookLabCopyabilityWarningSection({
  doNotCopy,
  warnings,
}: {
  doNotCopy: string[];
  warnings: string[];
}) {
  if (!warnings.length && !doNotCopy.length) {
    return null;
  }

  return (
    <section aria-labelledby="hook-lab-copyability-warnings">
      <h3
        className="text-xl font-bold text-text-primary"
        id="hook-lab-copyability-warnings"
      >
        What may not transfer
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        These are possible risks from the public evidence, not proven causes of
        performance.
      </p>
      {warnings.length ? (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
      {doNotCopy.length ? (
        <div className="mt-5 rounded-lg bg-surface-muted p-4">
          <p className="text-sm font-semibold text-text-primary">Leave these behind</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {doNotCopy.join(" ")}
          </p>
        </div>
      ) : null}
    </section>
  );
}
