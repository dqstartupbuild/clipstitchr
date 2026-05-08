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
        title="No photos or UGC clips yet"
        description="Upload person photos and UGC clips from the uploads page before using Swapr."
      />
    );
  }

  if (!hasPhotos) {
    return (
      <DashboardEmptyState
        title="No photos yet"
        description="Upload person photos from the uploads page so they can be selected in Swapr."
      />
    );
  }

  return (
    <DashboardEmptyState
      title="No UGC clips yet"
      description="Upload a video and classify it as UGC before using Swapr."
    />
  );
}
