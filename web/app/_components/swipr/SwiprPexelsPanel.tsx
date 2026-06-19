"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { PexelsPhotoCard } from "@/app/_components/swipr/PexelsPhotoCard";
import { SwiprLibraryPackEditor } from "@/app/_components/swipr/SwiprLibraryPackEditor";
import { SwiprLibraryPackPicker } from "@/app/_components/swipr/SwiprLibraryPackPicker";
import { SwiprLibraryPhotoCard } from "@/app/_components/swipr/SwiprLibraryPhotoCard";
import { Button } from "@/app/_components/ui/Button";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

type SwiprPexelsPanelProps = {
  allLibraryBackgrounds: SwiprBackgroundAsset[];
  error: string | null;
  isLoadingMore: boolean;
  isImportingLibrary: boolean;
  isSaving: boolean;
  isSearching: boolean;
  isUpdatingLibraryPack: boolean;
  libraryBackgrounds: SwiprBackgroundAsset[];
  libraryPacks: SwiprLibraryPack[];
  photos: PexelsPhotoResult[];
  query: string;
  selectedLibraryQueries: string[];
  allowLibraryPackEditing?: boolean;
  showImportControls: boolean;
  showLibraryPacks: boolean;
  showSavedLibraryPhotos: boolean;
  showSearch?: boolean;
  hasMorePhotos: boolean;
  onDeleteLibraryPack: (packName: string) => Promise<void>;
  onImportQuery: () => void;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onLoadMore: () => void;
  onQueryChange: (query: string) => void;
  onRemoveLibraryPhotoFromPack: (
    background: SwiprBackgroundAsset,
  ) => Promise<void>;
  onRenameLibraryPack: (fromName: string, toName: string) => Promise<string>;
  onSearch: () => void;
  onSelectSavedBackground?: (background: SwiprBackgroundAsset) => void;
  onSelectPhoto?: (photo: PexelsPhotoResult) => void;
  onSelectedLibraryQueriesChange: (queries: string[]) => void;
};

export function SwiprPexelsPanel({
  allLibraryBackgrounds,
  error,
  isLoadingMore,
  isImportingLibrary,
  isSaving,
  isSearching,
  isUpdatingLibraryPack,
  libraryBackgrounds,
  libraryPacks,
  photos,
  query,
  selectedLibraryQueries,
  allowLibraryPackEditing = true,
  showImportControls,
  showLibraryPacks,
  showSavedLibraryPhotos,
  showSearch = true,
  hasMorePhotos,
  onDeleteLibraryPack,
  onImportQuery,
  onLoadBackgroundBlob,
  onLoadMore,
  onQueryChange,
  onRemoveLibraryPhotoFromPack,
  onRenameLibraryPack,
  onSearch,
  onSelectSavedBackground,
  onSelectPhoto,
  onSelectedLibraryQueriesChange,
}: SwiprPexelsPanelProps) {
  const [editingPackName, setEditingPackName] = useState<string | null>(null);
  const editingPack = useMemo(
    () => libraryPacks.find((pack) => pack.name === editingPackName) ?? null,
    [editingPackName, libraryPacks],
  );

  return (
    <section className="min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Search aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Pexels</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            {showSearch ? "Search photos" : "Choose packs"}
          </h2>
        </div>
      </div>
      <div className="grid gap-4">
        {showSearch ? (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <SearchInput
              label="Search Pexels photos"
              value={query}
              onChange={onQueryChange}
              placeholder="Search lifestyle photos"
            />
            <Button
              type="button"
              size="sm"
              icon={<Search aria-hidden className="h-4 w-4" />}
              isLoading={isSearching}
              disabled={isSaving || !query.trim()}
              onClick={onSearch}
            >
              Search
            </Button>
          </div>
        ) : null}
        {showImportControls ? (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <p className="text-sm font-semibold text-text-secondary">
              Save the loaded photos as a reusable photo pack.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<Download aria-hidden className="h-4 w-4" />}
              isLoading={isImportingLibrary}
              disabled={isSaving || !query.trim() || !photos.length}
              onClick={onImportQuery}
            >
              Import loaded
            </Button>
          </div>
        ) : null}
        <p className="text-xs font-semibold text-text-tertiary">
          Photos provided by Pexels.
        </p>
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        {showSearch && photos.length ? (
          <div className="grid gap-2">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {photos.map((photo) => (
                <PexelsPhotoCard
                  key={photo.id}
                  isSaving={isSaving}
                  photo={photo}
                  onSelect={onSelectPhoto}
                />
              ))}
            </div>
            {hasMorePhotos ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                isLoading={isLoadingMore}
                disabled={isSaving || isSearching || isLoadingMore}
                onClick={onLoadMore}
              >
                Load more
              </Button>
            ) : null}
          </div>
        ) : null}
        {showLibraryPacks ? (
          <SwiprLibraryPackPicker
            packs={libraryPacks}
            selectedPackNames={selectedLibraryQueries}
            onEditPack={
              allowLibraryPackEditing ? setEditingPackName : undefined
            }
            onSelectedPackNamesChange={onSelectedLibraryQueriesChange}
          />
        ) : null}
        {showLibraryPacks && allowLibraryPackEditing && editingPack ? (
          <SwiprLibraryPackEditor
            key={editingPack.name}
            backgrounds={allLibraryBackgrounds}
            isSaving={isUpdatingLibraryPack}
            pack={editingPack}
            onDeletePack={(packName) =>
              onDeleteLibraryPack(packName).then(() => {
                setEditingPackName(null);
              })
            }
            onLoadBackgroundBlob={onLoadBackgroundBlob}
            onRemovePhoto={onRemoveLibraryPhotoFromPack}
            onRenamePack={(fromName, toName) =>
              onRenameLibraryPack(fromName, toName).then((nextName) => {
                setEditingPackName(nextName);

                return nextName;
              })
            }
          />
        ) : null}
        {showSavedLibraryPhotos &&
        onSelectSavedBackground &&
        libraryBackgrounds.length ? (
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {libraryBackgrounds.slice(0, 24).map((background) => (
              <SwiprLibraryPhotoCard
                key={background.id}
                background={background}
                isSaving={isSaving}
                onLoadBackgroundBlob={onLoadBackgroundBlob}
                onSelect={onSelectSavedBackground}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
