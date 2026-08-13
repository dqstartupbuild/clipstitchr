import { rename } from "node:fs/promises";
import { dirname, join } from "node:path";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { assertStudioClipsProductUploadObjectKey } from "../../security/assertStudioClipsProductUploadObjectKey";
import type { StudioClipsR2ObjectStore } from "./StudioClipsR2ObjectStore";
import type { StudioClipsCustomFont } from "./StudioClipsCustomFont";
import { readStudioClipsFontMetadata } from "./readStudioClipsFontMetadata";

const maximumFontBytes = 10 * 1024 * 1024;
const openTypeContentTypes = new Set([
  "application/x-font-opentype",
  "font/otf",
]);
const trueTypeContentTypes = new Set([
  "application/x-font-truetype",
  "font/ttf",
]);
const sfntContentTypes = new Set(["application/font-sfnt", "font/sfnt"]);

export async function acquireStudioClipsCustomFont(input: {
  objectKey: string;
  objects: StudioClipsR2ObjectStore;
  ownerId: string;
  productId: string;
  workspacePath: string;
}): Promise<StudioClipsCustomFont> {
  assertStudioClipsProductUploadObjectKey({
    kind: "font",
    objectKey: input.objectKey,
    ownerId: input.ownerId,
    productId: input.productId,
  });
  const object = await input.objects.inspectFile({ key: input.objectKey });
  if (
    object.sizeBytes < 1 ||
    object.sizeBytes > maximumFontBytes ||
    (!openTypeContentTypes.has(object.contentType) &&
      !trueTypeContentTypes.has(object.contentType) &&
      !sfntContentTypes.has(object.contentType))
  ) {
    throw new StudioClipsWorkerError({
      code: "UNSUPPORTED_CUSTOM_FONT",
      kind: "permanent",
      publicMessage: "Choose a TrueType or OpenType caption font under 10 MB.",
    });
  }
  const stagedPath = join(input.workspacePath, "custom-caption-font.upload");
  await input.objects.downloadFile({
    contentType: object.contentType,
    expectedEtag: object.etag,
    key: input.objectKey,
    maximumBytes: maximumFontBytes,
    outputPath: stagedPath,
    sizeBytes: object.sizeBytes,
  });
  const font = await readStudioClipsFontMetadata(stagedPath);
  if (
    (openTypeContentTypes.has(object.contentType) && font.format !== "otf") ||
    (trueTypeContentTypes.has(object.contentType) && font.format !== "ttf")
  ) {
    throw new StudioClipsWorkerError({
      code: "CUSTOM_FONT_FORMAT_MISMATCH",
      kind: "permanent",
      publicMessage:
        "The custom caption font does not match its uploaded format.",
    });
  }
  const localPath = join(
    input.workspacePath,
    `custom-caption-font.${font.format}`,
  );
  await rename(stagedPath, localPath);
  return {
    family: font.family,
    fontsDirectory: dirname(localPath),
    localPath,
  };
}
