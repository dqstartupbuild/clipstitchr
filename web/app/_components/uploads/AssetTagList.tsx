import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type AssetTagListProps = {
  tags?: string[];
  className?: string;
  maxVisible?: number;
  requiredTag?: string;
};

export function AssetTagList({
  tags = [],
  className = "",
  maxVisible = 4,
  requiredTag,
}: AssetTagListProps) {
  const normalizedTags = requiredTag
    ? normalizeAssetTagsWithRequiredTag(tags, requiredTag)
    : normalizeAssetTags(tags);

  if (!normalizedTags.length) {
    return null;
  }

  const visibleTags = normalizedTags.slice(0, maxVisible);
  const hiddenTagCount = normalizedTags.length - visibleTags.length;

  return (
    <div className={["flex min-w-0 flex-wrap gap-1.5", className].join(" ")}>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex min-w-0 max-w-full items-center truncate rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold leading-none text-text-tertiary"
        >
          {tag}
        </span>
      ))}
      {hiddenTagCount > 0 ? (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold leading-none text-text-tertiary">
          +{hiddenTagCount}
        </span>
      ) : null}
    </div>
  );
}
