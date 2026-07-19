"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { PexelsPhotoCard } from "@/app/_components/swipr/PexelsPhotoCard";
import { PexelsLibraryFilterTabs } from "@/app/_components/library/PexelsLibraryFilterTabs";
import { PexelsLibraryPackCard } from "@/app/_components/library/PexelsLibraryPackCard";
import { SwiprLibraryPackDialog } from "@/app/_components/swipr/SwiprLibraryPackDialog";
import { Button } from "@/app/_components/ui/Button";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { importPexelsPhotosToSwiprLibrary } from "@/lib/clipstitchr/client/importPexelsPhotosToSwiprLibrary";
import { searchPexelsPhotos } from "@/lib/clipstitchr/client/searchPexelsPhotos";
import { SWIPR_PEXELS_IMPORT_LIMIT } from "@/lib/clipstitchr/constants/swiprPexelsImportLimit";
import { usePexelsLibraryPackBackgrounds } from "@/lib/clipstitchr/hooks/usePexelsLibraryPackBackgrounds";
import type { PexelsLibraryFilter } from "@/lib/clipstitchr/types/PexelsLibraryFilter";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { RenameSwiprLibraryPackResult } from "@/lib/clipstitchr/types/SwiprLibraryValue";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import { filterPexelsLibraryPacksBySearchQuery } from "@/lib/clipstitchr/utils/filterPexelsLibraryPacksBySearchQuery";
import { getPexelsLibraryPackKeys } from "@/lib/clipstitchr/utils/getPexelsLibraryPackKeys";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

const PEXELS_SEARCH_PER_PAGE = 12;

type PexelsLibraryTabSectionProps = {
  isLoading: boolean;
  packs: SwiprLibraryPack[];
  searchQuery: string;
  onAddPackToAccount: (
    packName: string,
  ) => Promise<RenameSwiprLibraryPackResult>;
  onLoadBackgroundBlob: (
    id: string,
    imageObject?: R2ObjectReference,
  ) => Promise<Blob>;
  onRemovePackFromAccount: (packName: string) => Promise<number>;
  onRemovePhotoFromPack: (background: SwiprBackgroundAsset) => Promise<void>;
};

export function PexelsLibraryTabSection({
  isLoading,
  packs,
  searchQuery,
  onAddPackToAccount,
  onLoadBackgroundBlob,
  onRemovePackFromAccount,
  onRemovePhotoFromPack,
}: PexelsLibraryTabSectionProps) {
  const [filter, setFilter] = useState<PexelsLibraryFilter>("all");
  const [viewingPackName, setViewingPackName] = useState<string | null>(null);
  const [pexelsQuery, setPexelsQuery] = useState("");
  const [pexelsPhotos, setPexelsPhotos] = useState<PexelsPhotoResult[]>([]);
  const [pexelsPage, setPexelsPage] = useState(1);
  const [hasMorePexelsPhotos, setHasMorePexelsPhotos] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [savingPackName, setSavingPackName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const minePacks = useMemo(
    () =>
      packs
        .filter((pack) => pack.isInAccount)
        .map((pack) => {
          const covers = pack.accountCovers ?? pack.covers;

          return {
            ...pack,
            count: pack.accountCount ?? pack.count,
            coverBackgroundIds:
              covers?.map((cover) => cover.backgroundId) ??
              pack.coverBackgroundIds,
            covers,
          };
        }),
    [packs],
  );
  const minePackKeys = useMemo(
    () => getPexelsLibraryPackKeys(minePacks),
    [minePacks],
  );
  const filteredPacks = useMemo(
    () =>
      filterPexelsLibraryPacksBySearchQuery(
        filter === "all" ? packs : minePacks,
        searchQuery,
      ),
    [filter, minePacks, packs, searchQuery],
  );
  const viewingPacks = filter === "mine" ? minePacks : packs;
  const viewingPack =
    viewingPacks.find((pack) => pack.name === viewingPackName) ??
    packs.find((pack) => pack.name === viewingPackName) ??
    null;
  const viewingPackIsMine = viewingPack
    ? minePackKeys.has(normalizeSwiprLibraryQueryKey(viewingPack.name))
    : false;
  const viewingPackBackgrounds = usePexelsLibraryPackBackgrounds(
    viewingPack?.name ?? null,
    filter === "mine" && viewingPackIsMine,
  );
  const visiblePexelsPhotos = pexelsPhotos;

  const handlePexelsQueryChange = (query: string) => {
    setPexelsQuery(query);
    setPexelsPage(1);
    setHasMorePexelsPhotos(false);
    setPexelsPhotos([]);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setError(null);
    setMessage(null);

    void searchPexelsPhotos({
      page: 1,
      perPage: PEXELS_SEARCH_PER_PAGE,
      query: pexelsQuery,
    })
      .then(({ hasMore, photos }) => {
        setPexelsPhotos(photos);
        setPexelsPage(1);
        setHasMorePexelsPhotos(hasMore);
        setError(
          photos.length ? null : "No new photos found. Try loading more.",
        );
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to search Pexels.",
        );
      })
      .finally(() => setIsSearching(false));
  };

  const handleLoadMore = () => {
    if (pexelsPhotos.length >= SWIPR_PEXELS_IMPORT_LIMIT) {
      setHasMorePexelsPhotos(false);
      return;
    }

    const nextPage = pexelsPage + 1;

    setIsLoadingMore(true);
    setError(null);

    void searchPexelsPhotos({
      page: nextPage,
      perPage: PEXELS_SEARCH_PER_PAGE,
      query: pexelsQuery,
    })
      .then(({ hasMore, photos }) => {
        const existingPhotoIds = new Set(pexelsPhotos.map((photo) => photo.id));
        const nextPhotos = [
          ...pexelsPhotos,
          ...photos.filter((photo) => !existingPhotoIds.has(photo.id)),
        ].slice(0, SWIPR_PEXELS_IMPORT_LIMIT);

        setPexelsPhotos(nextPhotos);
        setPexelsPage(nextPage);
        setHasMorePexelsPhotos(
          hasMore && nextPhotos.length < SWIPR_PEXELS_IMPORT_LIMIT,
        );
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to search Pexels.",
        );
      })
      .finally(() => setIsLoadingMore(false));
  };

  const handleImport = () => {
    if (!visiblePexelsPhotos.length) {
      setError("No new loaded photos to import.");
      return;
    }

    setIsImporting(true);
    setError(null);
    setMessage(null);

    void importPexelsPhotosToSwiprLibrary({
      page: pexelsPage,
      photos: visiblePexelsPhotos,
      query: pexelsQuery,
    })
      .then((result) => {
        const importedPhotoIds = new Set(result.importedPexelsPhotoIds);

        setPexelsPhotos((currentPhotos) =>
          currentPhotos.filter((photo) => !importedPhotoIds.has(photo.id)),
        );
        setFilter("mine");
        setMessage(
          result.imported
            ? `Imported ${result.imported} Pexels photos for ${result.query}.`
            : `${result.query} is in your packs.`,
        );
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to import Pexels photos.",
        );
      })
      .finally(() => setIsImporting(false));
  };

  const handleAddPack = (packName: string) => {
    setSavingPackName(packName);
    setError(null);
    setMessage(null);

    void onAddPackToAccount(packName)
      .then((pack) => {
        setFilter("mine");
        setMessage(`${pack.libraryQuery} is ready in Swipr.`);
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to add pack.",
        );
      })
      .finally(() => setSavingPackName(null));
  };

  const handleRemovePack = async (packName: string) => {
    setSavingPackName(packName);
    setError(null);
    setMessage(null);

    try {
      await onRemovePackFromAccount(packName);
      setMessage(`${packName} is no longer in your packs.`);

      if (
        viewingPackName &&
        normalizeSwiprLibraryQueryKey(viewingPackName) ===
          normalizeSwiprLibraryQueryKey(packName)
      ) {
        setViewingPackName(null);
      }
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to remove pack.",
      );
      throw nextError;
    } finally {
      setSavingPackName(null);
    }
  };

  const handleRemovePhotoFromPack = async (
    background: SwiprBackgroundAsset,
  ) => {
    const packName = background.libraryQuery ?? viewingPackName ?? "";

    setSavingPackName(packName);
    setError(null);
    setMessage(null);

    try {
      await onRemovePhotoFromPack(background);
      setMessage(`${background.name} is no longer in your pack.`);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to remove this photo.",
      );
      throw nextError;
    } finally {
      setSavingPackName(null);
    }
  };

  return (
    <section id="pexels-packs" className="grid gap-6">
      <div className="grid gap-3 rounded-lg border border-border bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <SearchInput
            label="Search Pexels photos"
            value={pexelsQuery}
            onChange={handlePexelsQueryChange}
            placeholder="Search lifestyle photos"
          />
          <Button
            type="button"
            size="sm"
            icon={<Search aria-hidden className="h-4 w-4" />}
            isLoading={isSearching}
            disabled={!pexelsQuery.trim()}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <p className="text-sm font-semibold text-text-secondary">
            Save loaded photos as a reusable pack.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<Download aria-hidden className="h-4 w-4" />}
            isLoading={isImporting}
            disabled={!pexelsQuery.trim() || !visiblePexelsPhotos.length}
            onClick={handleImport}
          >
            Import loaded
          </Button>
        </div>
        <p className="text-xs font-semibold text-text-tertiary">
          Photos provided by Pexels.
        </p>
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-md border border-accent/25 bg-surface-muted px-3 py-2 text-xs font-semibold text-accent-dark">
            {message}
          </p>
        ) : null}
        {visiblePexelsPhotos.length ? (
          <div className="grid gap-2">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {visiblePexelsPhotos.map((photo) => (
                <PexelsPhotoCard key={photo.id} isSaving photo={photo} />
              ))}
            </div>
            {hasMorePexelsPhotos ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                isLoading={isLoadingMore}
                disabled={isSearching || isLoadingMore}
                onClick={handleLoadMore}
              >
                Load more
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">Pexels packs</h2>
          <span className="text-sm font-semibold text-text-tertiary">
            {filteredPacks.length}
          </span>
        </div>
        <PexelsLibraryFilterTabs
          counts={{ all: packs.length, mine: minePacks.length }}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {isLoading ? (
        <p className="rounded-lg border border-border bg-white px-4 py-6 text-sm font-semibold text-text-secondary">
          Loading Pexels packs.
        </p>
      ) : filteredPacks.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPacks.map((pack) => {
            const packKey = normalizeSwiprLibraryQueryKey(pack.name);
            const isMine = minePackKeys.has(packKey);

            return (
              <PexelsLibraryPackCard
                key={packKey}
                isMine={isMine}
                isSaving={savingPackName === pack.name}
                pack={pack}
                onAdd={handleAddPack}
                onLoadBackgroundBlob={onLoadBackgroundBlob}
                onRemove={handleRemovePack}
                onView={setViewingPackName}
              />
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-white px-4 py-6 text-sm font-semibold text-text-secondary">
          {filter === "mine"
            ? "Add a Pexels pack to use it in Swipr."
            : "No Pexels packs yet. Search and import photos to start one."}
        </p>
      )}

      {viewingPack ? (
        <SwiprLibraryPackDialog
          key={`${filter}-${viewingPack.name}`}
          backgrounds={viewingPackBackgrounds.backgrounds}
          isLoading={viewingPackBackgrounds.isLoading}
          isMine={viewingPackIsMine}
          isSaving={savingPackName === viewingPack.name}
          pack={viewingPack}
          onDismiss={() => setViewingPackName(null)}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
          onRemovePack={(packName) =>
            handleRemovePack(packName).then(() => {
              setViewingPackName(null);
            })
          }
          onRemovePhoto={handleRemovePhotoFromPack}
        />
      ) : null}
    </section>
  );
}
