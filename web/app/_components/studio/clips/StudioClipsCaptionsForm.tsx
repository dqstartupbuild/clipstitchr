"use client";

import { useState } from "react";
import { submitStudioClipsRenderOperation } from "./submitStudioClipsRenderOperation";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/types/studioClips/StudioClipsCapabilities";
import type { StudioClipsCaptionStyle } from "@/lib/clipstitchr/types/studioClips/StudioClipsCaptionStyle";
import type { StudioClipsRenderOperationSave } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsRenderOperationSave";

type StudioClipsCaptionsFormProps = {
  captionStyle: StudioClipsCapabilities["captionStyle"];
  disabled: boolean;
  onSave: StudioClipsRenderOperationSave;
};

export function StudioClipsCaptionsForm({
  captionStyle,
  disabled,
  onSave,
}: StudioClipsCaptionsFormProps) {
  const firstTemplate = captionStyle.templates[0];
  const [enabled, setEnabled] = useState(true);
  const [style, setStyle] = useState<StudioClipsCaptionStyle>({
    fontColorHex: firstTemplate?.fontColorHex ?? "#FFFFFF",
    fontFamily: firstTemplate?.fontFamily ?? captionStyle.builtInFonts[0]?.id,
    fontSizePx: firstTemplate?.fontSizePx ?? captionStyle.fontSizeOptionsPx[0],
    templateId: firstTemplate?.id ?? "default",
  });
  const styleControlsDisabled = disabled || !enabled;
  return (
    <form
      onSubmit={(event) =>
        submitStudioClipsRenderOperation(event, onSave, {
          burnIn: enabled,
          enabled,
          kind: "captions",
          ...(enabled ? { style } : {}),
        })
      }
    >
      <h5>Caption rerender</h5>
      <label>
        <input
          checked={enabled}
          disabled={disabled}
          onChange={(event) => setEnabled(event.target.checked)}
          type="checkbox"
        />
        Burn captions into this version
      </label>
      <label>
        Template
        <select
          disabled={styleControlsDisabled}
          onChange={(event) => {
            const template = captionStyle.templates.find(
              (item) => item.id === event.target.value,
            );
            setStyle({
              ...style,
              templateId: event.target.value,
              ...(template
                ? {
                    fontColorHex: template.fontColorHex,
                    fontFamily: template.fontFamily,
                    fontSizePx: template.fontSizePx,
                  }
                : {}),
            });
          }}
          value={style.templateId}
        >
          {captionStyle.templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Font
        <select
          disabled={styleControlsDisabled}
          onChange={(event) =>
            setStyle({ ...style, fontFamily: event.target.value })
          }
          value={style.fontFamily}
        >
          {captionStyle.builtInFonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.displayName}
            </option>
          ))}
        </select>
      </label>
      <label>
        Size
        <select
          disabled={styleControlsDisabled}
          onChange={(event) =>
            setStyle({ ...style, fontSizePx: Number(event.target.value) })
          }
          value={style.fontSizePx}
        >
          {captionStyle.fontSizeOptionsPx.map((size) => (
            <option key={size} value={size}>
              {size} px
            </option>
          ))}
        </select>
      </label>
      <label>
        Color
        <input
          disabled={styleControlsDisabled}
          onChange={(event) =>
            setStyle({ ...style, fontColorHex: event.target.value.toUpperCase() })
          }
          type="color"
          value={(style.fontColorHex ?? "#FFFFFF").slice(0, 7)}
        />
      </label>
      <p>
        Caption rerenders need saved word timing and a clean source without
        burned-in captions.
      </p>
      <button disabled={disabled} type="submit">Render caption version</button>
    </form>
  );
}
