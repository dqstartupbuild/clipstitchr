"use client";

import { useCallback, useMemo, useState } from "react";
import { AvatarFilterSelect } from "@/app/_components/avatars/AvatarFilterSelect";
import { AvatarGenerationPanel } from "@/app/_components/avatars/AvatarGenerationPanel";
import { AvatarLibrarySection } from "@/app/_components/avatars/AvatarLibrarySection";
import { AvatarPhotoUploadControls } from "@/app/_components/avatars/AvatarPhotoUploadControls";
import { SelectedAvatarActions } from "@/app/_components/avatars/SelectedAvatarActions";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";
import { DEFAULT_AVATAR_STYLE_OPTION } from "@/lib/clipstitchr/constants/defaultAvatarStyleOption";
import { useAvatarPhotoGeneration } from "@/lib/clipstitchr/hooks/useAvatarPhotoGeneration";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import { dispatchHideUploadControlsEvent } from "@/lib/clipstitchr/utils/dispatchHideUploadControlsEvent";
import { filterPhotosBySearchQuery } from "@/lib/clipstitchr/utils/filterPhotosBySearchQuery";

type AvatarLibraryTabSectionProps = {
  searchQuery: string;
  showUploadControls: boolean;
};

export function AvatarLibraryTabSection({
  searchQuery,
  showUploadControls,
}: AvatarLibraryTabSectionProps) {
  const photoLibrary = usePhotoLibrary();
  const products = useDashboardProduct();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>();
  const [avatarFilterId, setAvatarFilterId] = useState<string | undefined>();
  const [uploadAvatarId, setUploadAvatarId] = useState("");
  const [newAvatarName, setNewAvatarName] = useState("");
  const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([]);
  const [pendingPhotoShouldExpandWithAi, setPendingPhotoShouldExpandWithAi] =
    useState(false);
  const [context, setContext] = useState("");
  const [count, setCount] = useState<AvatarPhotoGenerationCount>(3);
  const [lighting, setLighting] =
    useState<AvatarLightingOption>("any");
  const [location, setLocation] = useState("");
  const [outfit, setOutfit] = useState("");
  const [style, setStyle] = useState<AvatarStyleOption>(
    DEFAULT_AVATAR_STYLE_OPTION,
  );
  const defaultAvatar = useMemo(
    () =>
      photoLibrary.defaultAvatarId
        ? photoLibrary.avatars.find(
            (avatar) => avatar.id === photoLibrary.defaultAvatarId,
          )
        : undefined,
    [photoLibrary.avatars, photoLibrary.defaultAvatarId],
  );
  const activeAvatarFilterId = avatarFilterId ?? defaultAvatar?.id ?? "all";
  const activeUploadAvatarId = uploadAvatarId || defaultAvatar?.id || "";
  const defaultPhoto = useMemo(
    () =>
      defaultAvatar
        ? photoLibrary.photos.find((photo) => photo.avatarId === defaultAvatar.id)
        : undefined,
    [defaultAvatar, photoLibrary.photos],
  );
  const activeSelectedPhotoId =
    selectedPhotoId ??
    (avatarFilterId === undefined ? defaultPhoto?.id : undefined);
  const visiblePhotos = useMemo(
    () =>
      photoLibrary.photos.filter(
        (photo) =>
          activeAvatarFilterId === "all" ||
          photo.avatarId === activeAvatarFilterId,
      ),
    [activeAvatarFilterId, photoLibrary.photos],
  );
  const photos = useMemo(
    () => filterPhotosBySearchQuery(visiblePhotos, searchQuery),
    [searchQuery, visiblePhotos],
  );
  const selectedPhoto = useMemo(
    () => photoLibrary.photos.find((photo) => photo.id === activeSelectedPhotoId),
    [activeSelectedPhotoId, photoLibrary.photos],
  );
  const selectedPhotoAvatar = useMemo(
    () =>
      selectedPhoto?.avatarId
        ? photoLibrary.avatars.find((avatar) => avatar.id === selectedPhoto.avatarId)
        : undefined,
    [photoLibrary.avatars, selectedPhoto],
  );
  const selectedFilterAvatar = useMemo(
    () =>
      activeAvatarFilterId === "all"
        ? undefined
        : photoLibrary.avatars.find(
            (avatar) => avatar.id === activeAvatarFilterId,
          ),
    [activeAvatarFilterId, photoLibrary.avatars],
  );
  const selectedFilterAvatarPhotoCount = useMemo(
    () =>
      selectedFilterAvatar
        ? photoLibrary.photos.filter(
            (photo) => photo.avatarId === selectedFilterAvatar.id,
          ).length
        : 0,
    [photoLibrary.photos, selectedFilterAvatar],
  );
  const generator = useAvatarPhotoGeneration({
    loadPhoto: photoLibrary.loadPhoto,
    saveGeneratedPhotos: photoLibrary.saveGeneratedPhotos,
  });
  const hasSearchQuery = searchQuery.trim().length > 0;
  const error = photoLibrary.error ?? generator.error;
  const hasPhotoUploadAssignment =
    activeUploadAvatarId === "new"
      ? newAvatarName.trim().length > 0
      : activeUploadAvatarId.trim().length > 0;
  const canSavePendingPhotoUpload =
    pendingPhotoFiles.length > 0 &&
    hasPhotoUploadAssignment &&
    !photoLibrary.isSaving;
  const handlePhotoFilesSelected = useCallback(
    (
      files: FileList | File[],
      options?: { shouldExpandWithAi?: boolean },
    ) => {
      const acceptedFiles = Array.from(files).filter((file) =>
        ACCEPTED_PHOTO_TYPES.includes(file.type),
      );

      setPendingPhotoFiles(acceptedFiles);
      setPendingPhotoShouldExpandWithAi(Boolean(options?.shouldExpandWithAi));
    },
    [],
  );
  const savePendingPhotoUpload = useCallback(async () => {
    if (!canSavePendingPhotoUpload) {
      return;
    }

    const didSave = await photoLibrary.saveFiles(pendingPhotoFiles, {
      avatarId:
        activeUploadAvatarId === "new" ? undefined : activeUploadAvatarId,
      avatarName: activeUploadAvatarId === "new" ? newAvatarName : undefined,
      shouldExpandWithAi: pendingPhotoShouldExpandWithAi,
    });

    if (didSave) {
      setPendingPhotoFiles([]);

      if (activeUploadAvatarId === "new") {
        setUploadAvatarId("");
        setNewAvatarName("");
      }
    }
  }, [
    canSavePendingPhotoUpload,
    activeUploadAvatarId,
    newAvatarName,
    pendingPhotoFiles,
    pendingPhotoShouldExpandWithAi,
    photoLibrary,
  ]);
  const deleteAvatar = useCallback(
    async (avatar: Avatar) => {
      await photoLibrary.removeAvatar(avatar.id);
      setAvatarFilterId("all");
      setUploadAvatarId((currentAvatarId) =>
        currentAvatarId === avatar.id ? "" : currentAvatarId,
      );
      setSelectedPhotoId((currentPhotoId) => {
        const selectedPhotoBelongsToAvatar = photoLibrary.photos.some(
          (photo) => photo.id === currentPhotoId && photo.avatarId === avatar.id,
        );

        return selectedPhotoBelongsToAvatar ? undefined : currentPhotoId;
      });
    },
    [photoLibrary],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-2">
        <h2 className="text-2xl font-bold text-text-primary">Avatars</h2>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
          Save people you can reuse in Swapr, Clipr, and AI photo generation.
        </p>
      </div>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {generator.generatedCount ? (
          <div className="rounded-lg border border-accent/25 bg-surface-muted p-4 text-sm font-semibold text-accent-dark">
            Queued {generator.generatedCount} generated photos.
          </div>
        ) : null}
        {showUploadControls ? (
          <UploadPanel
            allowedAssetTypes={["photo"]}
            initialAssetType="photo"
            isPhotoUploading={photoLibrary.isSaving}
            onDismiss={dispatchHideUploadControlsEvent}
            photoControls={
              <AvatarPhotoUploadControls
                avatars={photoLibrary.avatars}
                canSave={canSavePendingPhotoUpload}
                isSaving={photoLibrary.isSaving}
                newAvatarName={newAvatarName}
                pendingFileCount={pendingPhotoFiles.length}
                selectedAvatarId={activeUploadAvatarId}
                onNewAvatarNameChange={setNewAvatarName}
                onSave={() => void savePendingPhotoUpload()}
                onSelectedAvatarIdChange={setUploadAvatarId}
              />
            }
            onPhotoExpandPreferenceChange={setPendingPhotoShouldExpandWithAi}
            onPhotoUploaded={handlePhotoFilesSelected}
            onUploaded={photoLibrary.refresh}
          />
        ) : null}
        <div className="grid gap-3">
          <div className="max-w-sm">
            <AvatarFilterSelect
              avatars={photoLibrary.avatars}
              label="Avatar"
              value={activeAvatarFilterId}
              onChange={setAvatarFilterId}
            />
          </div>
          <SelectedAvatarActions
            key={selectedFilterAvatar?.id ?? "all"}
            avatar={selectedFilterAvatar}
            favoriteVoiceId={photoLibrary.defaultCliprVoiceId}
            isDefaultAvatar={
              Boolean(selectedFilterAvatar) &&
              selectedFilterAvatar?.id === photoLibrary.defaultAvatarId
            }
            isSaving={photoLibrary.isSaving}
            photoCount={selectedFilterAvatarPhotoCount}
            products={products.products}
            onDelete={deleteAvatar}
            onProductChange={photoLibrary.updateAvatarProduct}
            onRename={photoLibrary.renameAvatar}
            onSetDefault={photoLibrary.setDefaultAvatar}
            onWardrobeStyleChange={photoLibrary.updateAvatarWardrobeStyle}
            onFavoriteVoiceChange={photoLibrary.setDefaultCliprVoice}
            onVoiceChange={photoLibrary.updateAvatarCliprVoice}
          />
        </div>
        <AvatarGenerationPanel
          count={count}
          context={context}
          isGenerating={generator.isGenerating || photoLibrary.isSaving}
          lighting={lighting}
          location={location}
          outfit={outfit}
          selectedAvatar={selectedPhotoAvatar}
          selectedPhoto={selectedPhoto}
          style={style}
          onCountChange={setCount}
          onGenerate={() => {
            if (selectedPhotoAvatar && selectedPhoto) {
              void generator.generate({
                avatar: selectedPhotoAvatar,
                count,
                context,
                lighting,
                location,
                outfit,
                referencePhoto: selectedPhoto,
                style,
              });
            }
          }}
          onContextChange={setContext}
          onLightingChange={setLighting}
          onLocationChange={setLocation}
          onOutfitChange={setOutfit}
          onStyleChange={setStyle}
        />
        <AvatarLibrarySection
          avatars={photoLibrary.avatars}
          photos={photos}
          selectedPhotoId={activeSelectedPhotoId}
          emptyTitle={hasSearchQuery ? "No matching avatars" : undefined}
          emptyDescription={
            hasSearchQuery
              ? "No avatars match that name, tag, or description."
              : "Upload photos of a person to make them available as avatars."
          }
          onLoadPhoto={photoLibrary.loadPhoto}
          onDelete={photoLibrary.removePhoto}
          onSelect={(photo) =>
            setSelectedPhotoId((currentPhotoId) =>
              currentPhotoId === photo.id ? undefined : photo.id,
            )
          }
          onUpdateMetadata={photoLibrary.updatePhotoMetadata}
        />
    </div>
  );
}
