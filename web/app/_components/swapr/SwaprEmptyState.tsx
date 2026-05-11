import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";

type SwaprEmptyStateProps = {
  hasPhotos: boolean;
  hasSourceClips: boolean;
};

export function SwaprEmptyState({
  hasPhotos,
  hasSourceClips,
}: SwaprEmptyStateProps) {
  if (!hasPhotos && !hasSourceClips) {
    return (
      <DashboardEmptyState
        title="No avatars or source videos yet"
        description="Create an avatar and add a UGC clip or stitch before creating swaps."
      />
    );
  }

  if (!hasPhotos) {
    return (
      <DashboardEmptyState
        title="No avatars yet"
        description="Create an avatar so it can be used for swaps."
      />
    );
  }

  return (
    <DashboardEmptyState
      title="No source videos yet"
      description="Upload a UGC clip or create a stitch before creating swaps."
    />
  );
}
