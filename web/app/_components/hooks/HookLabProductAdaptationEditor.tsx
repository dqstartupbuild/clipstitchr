import { HookLabCreativeBriefField } from "@/app/_components/hooks/HookLabCreativeBriefField";
import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import { splitHookLabAdaptationLines } from "@/lib/clipstitchr/utils/splitHookLabAdaptationLines";

export function HookLabProductAdaptationEditor({
  adaptation,
  onChange,
}: {
  adaptation: HookLabCreativeBriefContent;
  onChange: (
    key: keyof HookLabCreativeBriefContent,
    value: string | string[],
  ) => void;
}) {
  return (
    <div className="grid gap-10">
      <fieldset className="grid gap-5">
        <legend className="text-balance text-lg font-bold text-text-primary">
          Concept
        </legend>
        <HookLabCreativeBriefField
          label="Adapted concept"
          value={adaptation.adaptedConcept ?? adaptation.directionName}
          onChange={(value) => onChange("adaptedConcept", value)}
        />
        <HookLabCreativeBriefField
          label="Opening reaction"
          value={adaptation.openingReaction ?? adaptation.openingVisual}
          onChange={(value) => onChange("openingReaction", value)}
        />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="text-balance text-lg font-bold text-text-primary">
          Production plan
        </legend>
        <HookLabCreativeBriefField
          label="Scene-by-scene shot directions, one scene per line"
          value={(
            adaptation.sceneBySceneDirections ?? adaptation.beatScript
          ).join("\n")}
          onChange={(value) =>
            onChange(
              "sceneBySceneDirections",
              splitHookLabAdaptationLines(value),
            )
          }
        />
        <HookLabCreativeBriefField
          label="Props and interactions, one prop sequence per line"
          value={(
            adaptation.propsAndInteractions ?? adaptation.footageNeeds
          ).join("\n")}
          onChange={(value) =>
            onChange(
              "propsAndInteractions",
              splitHookLabAdaptationLines(value),
            )
          }
        />
        <HookLabCreativeBriefField
          label="Product demonstration"
          value={adaptation.productDemonstration ?? adaptation.productProof}
          onChange={(value) => onChange("productDemonstration", value)}
        />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="text-balance text-lg font-bold text-text-primary">
          Copy
        </legend>
        <HookLabCreativeBriefField
          label="Spoken lines, one scene per line"
          value={(adaptation.spokenLines ?? [adaptation.hook]).join("\n")}
          onChange={(value) =>
            onChange("spokenLines", splitHookLabAdaptationLines(value))
          }
        />
        <HookLabCreativeBriefField
          label="On-screen text by scene, one scene per line"
          value={(
            adaptation.onScreenTextByScene ?? [adaptation.soundOffOverlay]
          ).join("\n")}
          onChange={(value) =>
            onChange("onScreenTextByScene", splitHookLabAdaptationLines(value))
          }
        />
        <HookLabCreativeBriefField
          label="Closing CTA"
          value={adaptation.closingCta ?? adaptation.callToAction}
          onChange={(value) => onChange("closingCta", value)}
        />
        <HookLabCreativeBriefField
          label="Adapted caption"
          value={adaptation.adaptedCaption ?? ""}
          onChange={(value) => onChange("adaptedCaption", value)}
        />
      </fieldset>
    </div>
  );
}
