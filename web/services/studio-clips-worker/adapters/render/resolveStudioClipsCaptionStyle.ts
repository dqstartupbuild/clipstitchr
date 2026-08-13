import { resolve } from "node:path";
import type { StudioClipsClaimCaptionStyle } from "../../contracts/StudioClipsClaimOptions";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { acquireStudioClipsCustomFont } from "../r2/acquireStudioClipsCustomFont";
import { readStudioClipsFontMetadata } from "../r2/readStudioClipsFontMetadata";
import type { StudioClipsR2ObjectStore } from "../r2/StudioClipsR2ObjectStore";
import { convertStudioClipsHexToAssColor } from "./convertStudioClipsHexToAssColor";
import { getStudioClipsBuiltInFont } from "./getStudioClipsBuiltInFont";
import { getStudioClipsCaptionTemplate } from "./getStudioClipsCaptionTemplate";
import type { StudioClipsResolvedCaptionStyle } from "./StudioClipsResolvedCaptionStyle";

export async function resolveStudioClipsCaptionStyle(input: {
  builtInFontsDirectory: string;
  outputHeight: number;
  ownerId: string;
  objects: StudioClipsR2ObjectStore;
  productId: string;
  style?: StudioClipsClaimCaptionStyle;
  workspacePath: string;
}): Promise<StudioClipsResolvedCaptionStyle> {
  const templateId = input.style?.templateId ?? "default";
  const template = getStudioClipsCaptionTemplate(templateId);
  if (!template) {
    throw new StudioClipsWorkerError({
      code: "UNSUPPORTED_CAPTION_TEMPLATE",
      kind: "permanent",
      publicMessage: "Choose a supported caption template.",
    });
  }
  const fontSizePx = input.style?.fontSizePx ?? template.fontSizePx;
  if (!Number.isInteger(fontSizePx) || fontSizePx < 8 || fontSizePx > 200) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CAPTION_SIZE",
      kind: "permanent",
      publicMessage: "Choose a caption size between 8 and 200 pixels.",
    });
  }

  let fontFamily: string;
  let fontsDirectory: string;
  if (input.style?.customFontObjectKey) {
    const customFont = await acquireStudioClipsCustomFont({
      objectKey: input.style.customFontObjectKey,
      objects: input.objects,
      ownerId: input.ownerId,
      productId: input.productId,
      workspacePath: input.workspacePath,
    });
    fontFamily = customFont.family;
    fontsDirectory = customFont.fontsDirectory;
  } else {
    const selectedFont = getStudioClipsBuiltInFont(
      input.style?.fontFamily ?? template.fontFamily,
    );
    if (!selectedFont) {
      throw new StudioClipsWorkerError({
        code: "UNSUPPORTED_CAPTION_FONT",
        kind: "permanent",
        publicMessage: "Choose a supported built-in caption font.",
      });
    }
    fontsDirectory = resolve(input.builtInFontsDirectory);
    const localPath = resolve(fontsDirectory, selectedFont.fileName);
    if (!localPath.startsWith(`${fontsDirectory}/`)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_BUILT_IN_FONT_PATH",
        kind: "permanent",
        publicMessage: "The built-in caption font path is invalid.",
      });
    }
    await readStudioClipsFontMetadata(localPath);
    fontFamily = selectedFont.family;
  }

  return {
    backColorAss: convertStudioClipsHexToAssColor(template.backColorHex),
    borderStyle: template.borderStyle,
    fontColorAss: convertStudioClipsHexToAssColor(
      input.style?.fontColorHex ?? template.fontColorHex,
    ),
    fontFamily,
    fontSizePx,
    fontsDirectory,
    marginVertical: Math.max(
      24,
      Math.round(input.outputHeight * (1 - template.positionY)),
    ),
    outlineColorAss: convertStudioClipsHexToAssColor(template.outlineColorHex),
    outlineWidth: template.outlineWidth,
    shadowDepth: template.shadowDepth,
  };
}
