"use client";

import { Edit3, RefreshCw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getUseStitchTemplateHref } from "@/lib/clipstitchr/utils/getUseStitchTemplateHref";

type StitchTemplateCardProps = {
  isDeleting: boolean;
  isSaving: boolean;
  template: StitchTemplate;
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
};

export function StitchTemplateCard({
  isDeleting,
  isSaving,
  template,
  onDelete,
  onRename,
}: StitchTemplateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(template.name);
  const [error, setError] = useState<string | null>(null);
  const handleRename = async () => {
    setError(null);

    try {
      await onRename(template.id, name);
      setIsEditing(false);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not rename that template.",
      );
    }
  };
  const handleDelete = async () => {
    const didConfirm = window.confirm(
      `Delete "${template.name}"?\n\nThis only removes the template. Your saved stitches and clips stay where they are.`,
    );

    if (!didConfirm) {
      return;
    }

    setError(null);

    try {
      await onDelete(template.id);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not delete that template.",
      );
    }
  };

  return (
    <article className="rounded-lg border border-border bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-text-primary">
            {template.name}
          </h2>
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {formatDuration(template.duration)} . {formatDate(template.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <IconButton
            label={isEditing ? "Close rename" : "Rename template"}
            icon={
              isEditing ? (
                <X aria-hidden className="h-4 w-4" />
              ) : (
                <Edit3 aria-hidden className="h-4 w-4" />
              )
            }
            disabled={isSaving || isDeleting}
            onClick={() => {
              setName(template.name);
              setIsEditing((editing) => !editing);
            }}
          />
          <IconButton
            label={isDeleting ? "Deleting template" : "Delete template"}
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            disabled={isSaving || isDeleting}
            onClick={() => void handleDelete()}
          />
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-border bg-white p-3 text-sm text-text-secondary">
        <p className="font-semibold text-text-primary">{template.sourceStitchName}</p>
        <p className="mt-1">
          {template.ugcClipName} + {template.demoClipName}
        </p>
      </div>
      {isEditing ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            aria-label="Template name"
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <Button
            type="button"
            size="sm"
            isLoading={isSaving}
            onClick={() => void handleRename()}
          >
            Save
          </Button>
        </div>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <div className="mt-4">
        <SecondaryButtonLink
          href={getUseStitchTemplateHref(template)}
          icon={<RefreshCw aria-hidden className="h-4 w-4" />}
          className="w-full"
        >
          Use in Stitchr
        </SecondaryButtonLink>
      </div>
    </article>
  );
}
