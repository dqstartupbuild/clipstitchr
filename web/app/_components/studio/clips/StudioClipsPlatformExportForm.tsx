"use client";

import { useState } from "react";
import { submitStudioClipsRenderOperation } from "./submitStudioClipsRenderOperation";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/types/studioClips/StudioClipsCapabilities";
import type { StudioClipsPlatformPreset } from "@/lib/clipstitchr/types/studioClips/StudioClipsPlatformPreset";
import type { StudioClipsRenderOperationSave } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsRenderOperationSave";

type StudioClipsPlatformExportFormProps = {
  disabled: boolean;
  onSave: StudioClipsRenderOperationSave;
  presets: StudioClipsCapabilities["platformExports"];
};

export function StudioClipsPlatformExportForm({
  disabled,
  onSave,
  presets,
}: StudioClipsPlatformExportFormProps) {
  const firstAvailablePreset = presets.find((item) => item.state === "available");
  const [preset, setPreset] = useState<StudioClipsPlatformPreset | "">(
    firstAvailablePreset?.id ?? "",
  );
  const controlsDisabled = disabled || !firstAvailablePreset;
  const availabilityId = "studio-clips-platform-export-availability";
  return (
    <form onSubmit={(event) => submitStudioClipsRenderOperation(event, onSave, preset ? { kind: "platform_export", preset } : null)}>
      <h5>Platform export</h5>
      <label>
        Destination format
        <select
          aria-describedby={!firstAvailablePreset ? availabilityId : undefined}
          disabled={controlsDisabled}
          onChange={(event) =>
            setPreset(event.target.value as StudioClipsPlatformPreset)
          }
          value={preset}
        >
          {!firstAvailablePreset ? (
            <option value="">No platform export available</option>
          ) : null}
          {presets.map((item) => (
            <option
              disabled={item.state === "unavailable"}
              key={item.id}
              value={item.id}
            >
              {item.label}
              {item.state === "unavailable" ? " (unavailable)" : ""}
            </option>
          ))}
        </select>
      </label>
      <button
        aria-describedby={!firstAvailablePreset ? availabilityId : undefined}
        disabled={controlsDisabled}
        type="submit"
      >
        Render platform export
      </button>
      {!firstAvailablePreset ? (
        <p id={availabilityId} role="status">
          Platform exports are unavailable in this environment.
        </p>
      ) : null}
    </form>
  );
}
