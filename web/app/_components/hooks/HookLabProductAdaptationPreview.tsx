import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";

export function HookLabProductAdaptationPreview({
  adaptation,
}: {
  adaptation: HookLabCreativeBriefContent;
}) {
  const sceneDirections =
    adaptation.sceneBySceneDirections ?? adaptation.beatScript;
  const spokenLines = adaptation.spokenLines ?? [adaptation.hook];
  const onScreenText = adaptation.onScreenTextByScene ?? [
    adaptation.soundOffOverlay,
  ];
  const props = adaptation.propsAndInteractions ?? adaptation.footageNeeds;

  return (
    <div className="grid gap-10">
      <section aria-labelledby="hook-lab-script-concept">
        <h4
          className="text-balance text-lg font-bold text-text-primary"
          id="hook-lab-script-concept"
        >
          Concept
        </h4>
        <dl className="mt-4 grid gap-5 lg:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-text-primary">
              Adapted concept
            </dt>
            <dd className="mt-2 whitespace-pre-wrap text-pretty text-sm leading-6 text-text-secondary">
              {adaptation.adaptedConcept ?? adaptation.directionName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-text-primary">
              Opening reaction
            </dt>
            <dd className="mt-2 whitespace-pre-wrap text-pretty text-sm leading-6 text-text-secondary">
              {adaptation.openingReaction ?? adaptation.openingVisual}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="hook-lab-script-production">
        <h4
          className="text-balance text-lg font-bold text-text-primary"
          id="hook-lab-script-production"
        >
          Production plan
        </h4>
        <div className="mt-4 grid gap-7">
          <div>
            <h5 className="text-sm font-semibold text-text-primary">
              Scene-by-scene directions
            </h5>
            <ol className="mt-3 grid gap-4">
              {sceneDirections.map((scene, index) => (
                <li
                  className="grid gap-2 sm:grid-cols-[2rem_minmax(0,1fr)]"
                  key={`${index}-${scene}`}
                >
                  <span className="tabular-nums text-sm font-semibold text-accent-dark">
                    {index + 1}.
                  </span>
                  <span className="whitespace-pre-wrap text-pretty text-sm leading-6 text-text-secondary">
                    {scene}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h5 className="text-sm font-semibold text-text-primary">
                Props and interactions
              </h5>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
                {props.map((item, index) => (
                  <li className="text-pretty" key={`${index}-${item}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-text-primary">
                Product demonstration
              </h5>
              <p className="mt-3 whitespace-pre-wrap text-pretty text-sm leading-6 text-text-secondary">
                {adaptation.productDemonstration ?? adaptation.productProof}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="hook-lab-script-copy">
        <h4
          className="text-balance text-lg font-bold text-text-primary"
          id="hook-lab-script-copy"
        >
          Copy
        </h4>
        <div className="mt-4 grid gap-7">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h5 className="text-sm font-semibold text-text-primary">
                Spoken lines
              </h5>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-text-secondary">
                {spokenLines.map((line, index) => (
                  <li className="text-pretty" key={`${index}-${line}`}>
                    {line}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-text-primary">
                On-screen text
              </h5>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-text-secondary">
                {onScreenText.map((line, index) => (
                  <li className="text-pretty" key={`${index}-${line}`}>
                    {line}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <dl className="grid gap-6 lg:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-text-primary">
                Closing CTA
              </dt>
              <dd className="mt-2 whitespace-pre-wrap text-pretty text-sm leading-6 text-text-secondary">
                {adaptation.closingCta ?? adaptation.callToAction}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-text-primary">
                Adapted caption
              </dt>
              <dd className="mt-2 whitespace-pre-wrap text-pretty text-sm leading-6 text-text-secondary">
                {adaptation.adaptedCaption}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
