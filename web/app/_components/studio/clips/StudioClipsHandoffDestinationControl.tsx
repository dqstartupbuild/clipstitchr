import type { StudioClipsHandoffDestination } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsHandoffDestination";

type StudioClipsHandoffDestinationControlProps = {
  destination: StudioClipsHandoffDestination;
  disabled: boolean;
  isMaterialized: boolean;
  label: string;
  materializeLabel: string;
  message: string;
  onMaterialize: (destination: StudioClipsHandoffDestination) => void;
  outputId: string;
};

export function StudioClipsHandoffDestinationControl({
  destination,
  disabled,
  isMaterialized,
  label,
  materializeLabel,
  message,
  onMaterialize,
  outputId,
}: StudioClipsHandoffDestinationControlProps) {
  const descriptionId = `handoff-limit-${outputId}-${destination}`;

  return (
    <section data-state={isMaterialized ? "ready" : "available"}>
      <h5>{label}</h5>
      <p id={descriptionId}>{message}</p>
      <button
        aria-describedby={descriptionId}
        disabled={disabled}
        type="button"
        onClick={() => onMaterialize(destination)}
      >
        {isMaterialized && destination === "library"
          ? "Open Product Library"
          : materializeLabel}
      </button>
    </section>
  );
}
