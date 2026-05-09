"use client";

import { Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AssetTagEditor } from "@/app/_components/uploads/AssetTagEditor";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type AssetMetadataEditDialogProps = {
  descriptionHelp?: string;
  descriptionLabel?: string;
  initialDescription?: string;
  initialLocationDescription?: string;
  title: string;
  initialName: string;
  initialOutfitDescription?: string;
  initialTags?: string[];
  requiredTag?: string;
  showPhotoDescriptionFields?: boolean;
  onClose: () => void;
  onSave: (metadata: AssetMetadataUpdate) => void | Promise<void>;
};

export function AssetMetadataEditDialog({
  descriptionHelp,
  descriptionLabel,
  initialDescription = "",
  initialLocationDescription = "",
  title,
  initialName,
  initialOutfitDescription = "",
  initialTags = [],
  requiredTag,
  showPhotoDescriptionFields = false,
  onClose,
  onSave,
}: AssetMetadataEditDialogProps) {
  const isMountedRef = useRef(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [outfitDescription, setOutfitDescription] = useState(
    initialOutfitDescription,
  );
  const [locationDescription, setLocationDescription] = useState(
    initialLocationDescription,
  );
  const [tags, setTags] = useState(() =>
    requiredTag
      ? normalizeAssetTagsWithRequiredTag(initialTags, requiredTag)
      : normalizeAssetTags(initialTags),
  );
  const [isSaving, setIsSaving] = useState(false);
  const trimmedName = name.trim();

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSave = async () => {
    if (!trimmedName) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        ...(descriptionLabel
          ? { avatarDescription: description.trim() }
          : {}),
        ...(showPhotoDescriptionFields
          ? {
              locationDescription: locationDescription.trim(),
              outfitDescription: outfitDescription.trim(),
            }
          : {}),
        name: trimmedName,
        tags: requiredTag
          ? normalizeAssetTagsWithRequiredTag(tags, requiredTag)
          : normalizeAssetTags(tags),
      });
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-metadata-dialog-title"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">Details</p>
            <h2
              id="asset-metadata-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {title}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close details editor"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col gap-5 p-5">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Title
            </span>
            <input
              type="text"
              value={name}
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent"
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
          <AssetTagEditor
            tags={tags}
            requiredTag={requiredTag}
            onChange={setTags}
          />
          {descriptionLabel ? (
            <label className="block">
              <span className="text-sm font-semibold text-text-primary">
                {descriptionLabel}
              </span>
              <textarea
                value={description}
                rows={5}
                className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                onChange={(event) =>
                  setDescription(event.currentTarget.value)
                }
              />
              {descriptionHelp ? (
                <span className="mt-2 block text-xs leading-5 text-text-tertiary">
                  {descriptionHelp}
                </span>
              ) : null}
            </label>
          ) : null}
          {showPhotoDescriptionFields ? (
            <>
              <label className="block">
                <span className="text-sm font-semibold text-text-primary">
                  Outfit description
                </span>
                <textarea
                  value={outfitDescription}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                  onChange={(event) =>
                    setOutfitDescription(event.currentTarget.value)
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text-primary">
                  Location description
                </span>
                <textarea
                  value={locationDescription}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                  onChange={(event) =>
                    setLocationDescription(event.currentTarget.value)
                  }
                />
              </label>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border p-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            icon={<Save aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={!trimmedName}
          >
            Save details
          </Button>
        </div>
      </form>
    </div>
  );
}
