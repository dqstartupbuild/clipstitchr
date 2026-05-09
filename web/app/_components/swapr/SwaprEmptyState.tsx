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
        description="Upload avatar photos from the Avatars page and UGC clips from the library before using Swapr."
      />
    );
  }

  if (!hasPhotos) {
    return (
      <DashboardEmptyState
        title="No avatars yet"
        description="Upload avatar photos from the Avatars page so they can be selected in Swapr."
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
