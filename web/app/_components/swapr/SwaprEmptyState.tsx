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
        description="Create an avatar and add an opener clip or Stitch before making swaps."
      />
    );
  }

  if (!hasPhotos) {
    return (
      <DashboardEmptyState
        title="No avatars yet"
        description="Create an avatar so Swapr has a person to work with."
      />
    );
  }

  return (
    <DashboardEmptyState
      title="No source videos yet"
      description="Upload an opener clip or create a Stitch before making swaps."
    />
  );
}
