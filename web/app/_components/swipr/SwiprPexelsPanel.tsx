"use client";

import { Search } from "lucide-react";
import { PexelsPhotoCard } from "@/app/_components/swipr/PexelsPhotoCard";
import { Button } from "@/app/_components/ui/Button";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";

type SwiprPexelsPanelProps = {
  error: string | null;
  isSaving: boolean;
  isSearching: boolean;
  photos: PexelsPhotoResult[];
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onSelectPhoto: (photo: PexelsPhotoResult) => void;
};

export function SwiprPexelsPanel({
  error,
  isSaving,
  isSearching,
  photos,
  query,
  onQueryChange,
  onSearch,
  onSelectPhoto,
}: SwiprPexelsPanelProps) {
  return (
    <section className="min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Search aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Pexels</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Search photos
          </h2>
        </div>
      </div>
      <div className="grid gap-3">
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
        <p className="text-xs font-semibold text-text-tertiary">
          Photos provided by Pexels.
        </p>
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        {photos.length ? (
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
        ) : null}
      </div>
    </section>
  );
}
