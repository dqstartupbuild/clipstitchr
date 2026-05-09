import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";

type SwaprEmptyStateProps = {
  hasPhotos: boolean;
  hasUgcClips: boolean;
};

export function SwaprEmptyState({
  hasPhotos,
  hasUgcClips,
}: SwaprEmptyStateProps) {
  if (!hasPhotos && !hasUgcClips) {
    return (
      <DashboardEmptyState
        title="No avatars or UGC clips yet"
        description="Create an avatar and add a UGC clip before creating swaps."
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
      title="No UGC clips yet"
      description="Upload a UGC clip before creating swaps."
    />
  );
}
