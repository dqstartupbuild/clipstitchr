import { HookLabCreativeBriefField } from "@/app/_components/hooks/HookLabCreativeBriefField";
import { Button } from "@/app/_components/ui/Button";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import { formatHookLabProductAdaptation } from "@/lib/clipstitchr/utils/formatHookLabProductAdaptation";
import { splitHookLabAdaptationLines } from "@/lib/clipstitchr/utils/splitHookLabAdaptationLines";

export function HookLabProductAdaptationEditor({
  adaptation,
  isSaving,
  onChange,
  onSave,
}: {
  adaptation: HookLabCreativeBriefContent;
  isSaving: boolean;
  onChange: (
    key: keyof HookLabCreativeBriefContent,
    value: string | string[],
  ) => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-6 grid gap-5">
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
      <HookLabCreativeBriefField
        label="Scene-by-scene shot directions, one scene per line"
        value={(
          adaptation.sceneBySceneDirections ?? adaptation.beatScript
        ).join("\n")}
        onChange={(value) =>
          onChange("sceneBySceneDirections", splitHookLabAdaptationLines(value))
        }
      />
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
        label="Props and interactions, one prop sequence per line"
        value={(
          adaptation.propsAndInteractions ?? adaptation.footageNeeds
        ).join("\n")}
        onChange={(value) =>
          onChange("propsAndInteractions", splitHookLabAdaptationLines(value))
        }
      />
      <HookLabCreativeBriefField
        label="Product demonstration"
        value={adaptation.productDemonstration ?? adaptation.productProof}
        onChange={(value) => onChange("productDemonstration", value)}
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
      <div className="flex flex-wrap items-center gap-3">
        <Button
          isLoading={isSaving}
          type="button"
          variant="secondary"
          onClick={onSave}
        >
          Save edits
        </Button>
        <CopyTextButton
          label="Copy script"
          text={formatHookLabProductAdaptation(adaptation)}
        />
      </div>
    </div>
  );
}
