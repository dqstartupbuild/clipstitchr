import { Trash2 } from "lucide-react";
import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";
import { rawCampaignAssetRoleLabels } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/rawCampaignAssetRoleLabels";
import { rawCampaignAssetRoles } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/rawCampaignAssetRoles";

type RawCampaignAssetRowProps = {
  asset: RawCampaignAsset;
  onChange: (value: RawCampaignAsset) => void;
  onRemove: () => void;
};

export function RawCampaignAssetRow({
  asset,
  onChange,
  onRemove,
}: RawCampaignAssetRowProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-slate-50 p-3 sm:grid-cols-[1.2fr_0.8fr_1fr_auto] sm:items-end">
      <label className="text-xs font-bold text-text-secondary">
        Clip name
        <input
          type="text"
          maxLength={100}
          value={asset.name}
          className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          onChange={(event) =>
            onChange({ ...asset, name: event.currentTarget.value })
          }
        />
      </label>
      <label className="text-xs font-bold text-text-secondary">
        Role
        <select
          value={asset.role}
          className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          onChange={(event) =>
            onChange({
              ...asset,
              role: event.currentTarget.value as RawCampaignAsset["role"],
            })
          }
        >
          {rawCampaignAssetRoles.map((role) => (
            <option key={role} value={role}>
              {rawCampaignAssetRoleLabels[role]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold text-text-secondary">
        Tags
        <input
          type="text"
          maxLength={160}
          value={asset.tags}
          placeholder="audience, angle, promise"
          className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          onChange={(event) =>
            onChange({ ...asset, tags: event.currentTarget.value })
          }
        />
      </label>
      <button
        type="button"
        aria-label={`Remove ${asset.name || "asset"}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-tertiary hover:border-red-300 hover:text-red-700"
        onClick={onRemove}
      >
        <Trash2 aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
