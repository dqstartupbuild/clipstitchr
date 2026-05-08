"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";
import { parseAssetTagsInput } from "@/lib/clipstitchr/utils/parseAssetTagsInput";

type AssetTagEditorProps = {
  tags: string[];
  requiredTag?: string;
  onChange: (tags: string[]) => void;
};

export function AssetTagEditor({
  tags,
  requiredTag,
  onChange,
}: AssetTagEditorProps) {
  const [draftTag, setDraftTag] = useState("");
  const normalizedTags = requiredTag
    ? normalizeAssetTagsWithRequiredTag(tags, requiredTag)
    : normalizeAssetTags(tags);

  const addDraftTags = () => {
    const nextTags = parseAssetTagsInput(draftTag);

    if (!nextTags.length) {
      return;
    }

    onChange(normalizeAssetTags([...normalizedTags, ...nextTags]));
    setDraftTag("");
  };

  const removeTag = (removedTag: string) => {
    if (removedTag === requiredTag) {
      return;
    }

    onChange(normalizedTags.filter((tag) => tag !== removedTag));
  };

  return (
    <div>
      <label
        htmlFor="asset-tags-input"
        className="text-sm font-semibold text-text-primary"
      >
        Tags
      </label>
      {normalizedTags.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {normalizedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-text-secondary"
            >
              {tag}
              {tag === requiredTag ? null : (
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  className="rounded text-text-tertiary transition-colors hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  onClick={() => removeTag(tag)}
                >
                  <X aria-hidden className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex gap-2">
        <input
          id="asset-tags-input"
          type="text"
          value={draftTag}
          placeholder="Add tag"
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
          onChange={(event) => setDraftTag(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== ",") {
              return;
            }

            event.preventDefault();
            addDraftTags();
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus aria-hidden className="h-4 w-4" />}
          onClick={addDraftTags}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
