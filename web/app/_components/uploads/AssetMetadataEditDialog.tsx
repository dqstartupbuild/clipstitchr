"use client";

import { Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AssetTagEditor } from "@/app/_components/uploads/AssetTagEditor";
import { Button } from "@/app/_components/ui/Button";
import { DashboardDialogViewport } from "@/app/_components/ui/DashboardDialogViewport";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type AssetMetadataEditDialogProps = {
  descriptionHelp?: string;
  descriptionLabel?: string;
  initialDescription?: string;
  initialLocationDescription?: string;
  initialMainPersonDescription?: string;
  title: string;
  initialName: string;
  initialOutfitDescription?: string;
  initialPoseDescription?: string;
  initialProductDescription?: string;
  initialProductId?: string;
  initialTags?: string[];
  initialVideoDescription?: string;
  products?: ProductProfile[];
  requiredTag?: string;
  showMainPersonDescriptionFields?: boolean;
  showPhotoDescriptionFields?: boolean;
  showProductDescriptionField?: boolean;
  showVideoDescriptionFields?: boolean;
  onClose: () => void;
  onSave: (metadata: AssetMetadataUpdate) => void | Promise<void>;
};

export function AssetMetadataEditDialog({
  descriptionHelp,
  descriptionLabel,
  initialDescription = "",
  initialLocationDescription = "",
  initialMainPersonDescription = "",
  title,
  initialName,
  initialOutfitDescription = "",
  initialPoseDescription = "",
  initialProductDescription = "",
  initialProductId = "",
  initialTags = [],
  initialVideoDescription = "",
  products = [],
  requiredTag,
  showMainPersonDescriptionFields = false,
  showPhotoDescriptionFields = false,
  showProductDescriptionField = false,
  showVideoDescriptionFields = false,
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
  const [mainPersonDescription, setMainPersonDescription] = useState(
    initialMainPersonDescription,
  );
  const [poseDescription, setPoseDescription] = useState(
    initialPoseDescription,
  );
  const [productDescription, setProductDescription] = useState(
    initialProductDescription,
  );
  const [productId, setProductId] = useState(() =>
    products.some((product) => product.id === initialProductId)
      ? initialProductId
      : "",
  );
  const [videoDescription, setVideoDescription] = useState(
    initialVideoDescription,
  );
  const [tags, setTags] = useState(() =>
    requiredTag
      ? normalizeAssetTagsWithRequiredTag(initialTags, requiredTag)
      : normalizeAssetTags(initialTags),
  );
  const [isSaving, setIsSaving] = useState(false);
  const trimmedName = name.trim();
  const shouldShowProductSelect =
    showProductDescriptionField && products.length > 0;
  const canSave =
    trimmedName.length > 0 && (!shouldShowProductSelect || productId.length > 0);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSave = async () => {
    if (!canSave) {
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
              poseDescription: poseDescription.trim(),
            }
          : {}),
        ...(showVideoDescriptionFields
          ? {
              locationDescription: locationDescription.trim(),
              poseDescription: poseDescription.trim(),
              videoDescription: videoDescription.trim(),
              ...(showMainPersonDescriptionFields
                ? {
                    mainPersonDescription: mainPersonDescription.trim(),
                    outfitDescription: outfitDescription.trim(),
                  }
                : {}),
              ...(showProductDescriptionField
                ? {
                    productDescription: productDescription.trim(),
                    ...(shouldShowProductSelect ? { productId } : {}),
                  }
                : {}),
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
    <DashboardDialogViewport onClose={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-metadata-dialog-title"
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
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
                  Pose description
                </span>
                <textarea
                  value={poseDescription}
                  rows={4}
                  placeholder="Body position, gesture, action, or how the person is posing"
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                  onChange={(event) =>
                    setPoseDescription(event.currentTarget.value)
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
          {showVideoDescriptionFields ? (
            <>
              {shouldShowProductSelect ? (
                <SelectInput
                  label="Product"
                  options={[
                    { label: "Select product", value: "" },
                    ...products.map((product) => ({
                      label: product.name,
                      value: product.id,
                    })),
                  ]}
                  value={productId}
                  onChange={(event) =>
                    setProductId(event.currentTarget.value)
                  }
                />
              ) : null}
              <label className="block">
                <span className="text-sm font-semibold text-text-primary">
                  {showProductDescriptionField
                    ? "Demo description"
                    : "Video description"}
                </span>
                <textarea
                  value={videoDescription}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                  onChange={(event) =>
                    setVideoDescription(event.currentTarget.value)
                  }
                />
              </label>
              {showProductDescriptionField ? (
                <label className="block">
                  <span className="text-sm font-semibold text-text-primary">
                    Product description
                  </span>
                  <textarea
                    value={productDescription}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                    onChange={(event) =>
                      setProductDescription(event.currentTarget.value)
                    }
                  />
                </label>
              ) : null}
              {showMainPersonDescriptionFields ? (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold text-text-primary">
                      Main person description
                    </span>
                    <textarea
                      value={mainPersonDescription}
                      rows={4}
                      className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                      onChange={(event) =>
                        setMainPersonDescription(event.currentTarget.value)
                      }
                    />
                  </label>
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
                </>
              ) : null}
              <label className="block">
                <span className="text-sm font-semibold text-text-primary">
                  {showProductDescriptionField
                    ? "Demo action description"
                    : "Pose or action description"}
                </span>
                <textarea
                  value={poseDescription}
                  rows={4}
                  placeholder="Body position, gesture, action, or what is happening"
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                  onChange={(event) =>
                    setPoseDescription(event.currentTarget.value)
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
            disabled={!canSave}
          >
            Save details
          </Button>
        </div>
      </form>
    </DashboardDialogViewport>
  );
}
