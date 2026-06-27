import { Button } from "@/app/_components/ui/Button";
import type { AutomaticPostBridgeSoundSource } from "@/lib/clipstitchr/types/AutomaticPostBridgeSoundSource";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type PostBridgeAutomaticSoundStatusProps = {
  hasAcceptedRights: boolean;
  isAcceptingRights: boolean;
  isLoading: boolean;
  selectedSource: AutomaticPostBridgeSoundSource | null;
  selectedTrack: SharedMusicTrack | null;
  onAcceptRights: () => void | Promise<void>;
};

export function PostBridgeAutomaticSoundStatus({
  hasAcceptedRights,
  isAcceptingRights,
  isLoading,
  selectedSource,
  selectedTrack,
  onAcceptRights,
}: PostBridgeAutomaticSoundStatusProps) {
  if (isLoading) {
    return (
      <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
        Checking sounds...
      </p>
    );
  }

  if (selectedTrack) {
    return (
      <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
        {selectedTrack.title} will be added
        {selectedSource === "saved" ? " from saved sounds." : "."}
      </p>
    );
  }

  if (hasAcceptedRights) {
    return (
      <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
        ClipStitchr will look for a sound when you schedule. If nothing fits,
        the post can still go without one.
      </p>
    );
  }

  return (
    <div className="grid gap-2 rounded-lg border border-accent/25 bg-surface-muted p-3">
      <p className="text-sm font-semibold text-accent-dark">
        Continue once to let ClipStitchr find sounds for you, or schedule
        without one.
      </p>
      <Button
        type="button"
        variant="secondary"
        isLoading={isAcceptingRights}
        onClick={() => void onAcceptRights()}
      >
        Continue
      </Button>
    </div>
  );
}
