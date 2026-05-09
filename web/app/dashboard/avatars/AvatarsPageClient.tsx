"use client";

import { useMemo, useState } from "react";
import { AvatarFilterSelect } from "@/app/_components/avatars/AvatarFilterSelect";
import { AvatarGenerationPanel } from "@/app/_components/avatars/AvatarGenerationPanel";
import { AvatarLibrarySection } from "@/app/_components/avatars/AvatarLibrarySection";
import { AvatarUploadAssignment } from "@/app/_components/avatars/AvatarUploadAssignment";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { useAvatarPhotoGeneration } from "@/lib/clipstitchr/hooks/useAvatarPhotoGeneration";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import { filterPhotosBySearchQuery } from "@/lib/clipstitchr/utils/filterPhotosBySearchQuery";

export function AvatarsPageClient() {
  const photoLibrary = usePhotoLibrary();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>();
  const [avatarFilterId, setAvatarFilterId] = useState("all");
  const [uploadAvatarId, setUploadAvatarId] = useState("new");
  const [newAvatarName, setNewAvatarName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [count, setCount] = useState<AvatarPhotoGenerationCount>(3);
  const [lighting, setLighting] =
    useState<AvatarLightingOption>("any");
  const [location, setLocation] = useState("");
  const [style, setStyle] = useState<AvatarStyleOption>("selfie");
  const visiblePhotos = useMemo(
    () =>
      photoLibrary.photos.filter(
        (photo) => avatarFilterId === "all" || photo.avatarId === avatarFilterId,
      ),
    [avatarFilterId, photoLibrary.photos],
  );
  const photos = useMemo(
    () => filterPhotosBySearchQuery(visiblePhotos, searchQuery),
    [searchQuery, visiblePhotos],
  );
  const selectedPhoto = useMemo(
    () => photoLibrary.photos.find((photo) => photo.id === selectedPhotoId),
    [photoLibrary.photos, selectedPhotoId],
  );
  const selectedAvatar = useMemo(
    () =>
      selectedPhoto?.avatarId
        ? photoLibrary.avatars.find((avatar) => avatar.id === selectedPhoto.avatarId)
        : undefined,
    [photoLibrary.avatars, selectedPhoto],
  );
  const generator = useAvatarPhotoGeneration({
    loadPhoto: photoLibrary.loadPhoto,
    saveGeneratedPhotos: photoLibrary.saveGeneratedPhotos,
  });
  const hasSearchQuery = searchQuery.trim().length > 0;
  const error = photoLibrary.error ?? generator.error;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <LibraryPageHeader
          eyebrow="Source photos"
          title="Avatars"
          description="Save person photos to use in Swapr when you need more UGC clips."
        />
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {generator.generatedCount ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            Saved {generator.generatedCount} generated avatar photos.
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-[240px_minmax(0,1fr)] sm:items-end">
          <AvatarFilterSelect
            avatars={photoLibrary.avatars}
            label="Avatar"
            value={avatarFilterId}
            onChange={setAvatarFilterId}
          />
          <SearchInput
            label="Search avatars"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search avatars"
            className="w-full"
          />
        </div>
        <AvatarLibrarySection
          avatars={photoLibrary.avatars}
          photos={photos}
          selectedPhotoId={selectedPhotoId}
          emptyTitle={hasSearchQuery ? "No matching avatars" : undefined}
          emptyDescription={
            hasSearchQuery
              ? "No avatars match that name, tag, or description."
              : "Upload photos of a person to make them available as avatars."
          }
          onLoadPhoto={photoLibrary.loadPhoto}
          onDelete={photoLibrary.removePhoto}
          onSelect={(photo) => setSelectedPhotoId(photo.id)}
          onUpdateMetadata={photoLibrary.updatePhotoMetadata}
        />
        <AvatarGenerationPanel
          count={count}
          isGenerating={generator.isGenerating || photoLibrary.isSaving}
          lighting={lighting}
          location={location}
          selectedAvatar={selectedAvatar}
          selectedPhoto={selectedPhoto}
          style={style}
          onCountChange={setCount}
          onGenerate={() => {
            if (selectedAvatar && selectedPhoto) {
              void generator.generate({
                avatar: selectedAvatar,
                count,
                lighting,
                location,
                referencePhoto: selectedPhoto,
                style,
              });
            }
          }}
          onLightingChange={setLighting}
          onLocationChange={setLocation}
          onStyleChange={setStyle}
        />
        <AvatarUploadAssignment
          avatars={photoLibrary.avatars}
          newAvatarName={newAvatarName}
          selectedAvatarId={uploadAvatarId}
          onNewAvatarNameChange={setNewAvatarName}
          onSelectedAvatarIdChange={setUploadAvatarId}
        />
        <UploadPanel
          allowedAssetTypes={["photo"]}
          initialAssetType="photo"
          isPhotoUploading={photoLibrary.isSaving}
          onPhotoUploaded={(files, options) =>
            photoLibrary.saveFiles(files, {
              ...options,
              avatarId: uploadAvatarId === "new" ? undefined : uploadAvatarId,
              avatarName: uploadAvatarId === "new" ? newAvatarName : undefined,
            })
          }
          onUploaded={photoLibrary.refresh}
        />
      </div>
    </DashboardShell>
  );
}
