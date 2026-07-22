import type { HookLabFormatDna } from "@/lib/clipstitchr/types/HookLabFormatDna";

export function HookLabFormatDnaSection({
  formatDna,
}: {
  formatDna: HookLabFormatDna;
}) {
  return (
    <section aria-labelledby="hook-lab-format-dna">
      <h3 className="text-xl font-bold text-text-primary" id="hook-lab-format-dna">
        How the reference works
      </h3>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-text-secondary">
        This is the reference&apos;s actual structure. The remake keeps its scene
        mechanics and timing while fitting your selected product.
      </p>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-semibold text-text-primary">Hook pattern</dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.hookPattern}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">Story shape</dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.storyFramework}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">Proof</dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.proofDevice}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">Product role</dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.productRole}
            {formatDna.productFirstAppearsAtSeconds === undefined
              ? ""
              : `, first seen around ${formatDna.productFirstAppearsAtSeconds.toFixed(1)}s`}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">
            Signature moment
          </dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.signatureDevice}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">Edit rhythm</dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.editRhythm}
          </dd>
        </div>
      </dl>
      <div className="mt-6 rounded-lg bg-surface-muted p-4">
        <p className="text-sm font-semibold text-text-primary">Remake spine</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {formatDna.replicationFormula}
        </p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="font-bold text-text-primary">What was observed</h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
            {formatDna.observedEvidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-text-primary">What is inferred</h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
            {formatDna.inferences.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
