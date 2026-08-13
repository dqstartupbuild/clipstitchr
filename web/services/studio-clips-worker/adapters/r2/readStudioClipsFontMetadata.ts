import { readFile } from "node:fs/promises";
import type { StudioClipsFontMetadata } from "./StudioClipsFontMetadata";
import { failInvalidStudioClipsFont } from "./failInvalidStudioClipsFont";
import { readStudioClipsFontName } from "./readStudioClipsFontName";

export async function readStudioClipsFontMetadata(
  localPath: string,
): Promise<StudioClipsFontMetadata> {
  const data = await readFile(localPath);
  if (data.byteLength < 12) failInvalidStudioClipsFont();
  const signature = data.subarray(0, 4);
  const format = signature.equals(Buffer.from("OTTO"))
    ? "otf"
    : signature.equals(Buffer.from([0, 1, 0, 0])) ||
        signature.equals(Buffer.from("true")) ||
        signature.equals(Buffer.from("typ1"))
      ? "ttf"
      : failInvalidStudioClipsFont();
  const tableCount = data.readUInt16BE(4);
  if (tableCount < 1 || tableCount > 4_096 || 12 + tableCount * 16 > data.length) {
    failInvalidStudioClipsFont();
  }

  let nameTableOffset: number | undefined;
  let nameTableLength: number | undefined;
  for (let index = 0; index < tableCount; index += 1) {
    const recordOffset = 12 + index * 16;
    if (data.toString("ascii", recordOffset, recordOffset + 4) !== "name") continue;
    nameTableOffset = data.readUInt32BE(recordOffset + 8);
    nameTableLength = data.readUInt32BE(recordOffset + 12);
    break;
  }
  if (
    nameTableOffset === undefined ||
    nameTableLength === undefined ||
    nameTableLength < 6 ||
    nameTableOffset + nameTableLength > data.length
  ) {
    failInvalidStudioClipsFont();
  }
  const recordCount = data.readUInt16BE(nameTableOffset + 2);
  const storageOffset = nameTableOffset + data.readUInt16BE(nameTableOffset + 4);
  if (
    recordCount > 16_384 ||
    nameTableOffset + 6 + recordCount * 12 > data.length ||
    storageOffset > nameTableOffset + nameTableLength
  ) {
    failInvalidStudioClipsFont();
  }

  const candidates: Array<{ family: string; preferred: boolean }> = [];
  for (let index = 0; index < recordCount; index += 1) {
    const recordOffset = nameTableOffset + 6 + index * 12;
    const platformId = data.readUInt16BE(recordOffset);
    const languageId = data.readUInt16BE(recordOffset + 4);
    const nameId = data.readUInt16BE(recordOffset + 6);
    const length = data.readUInt16BE(recordOffset + 8);
    const relativeOffset = data.readUInt16BE(recordOffset + 10);
    const valueOffset = storageOffset + relativeOffset;
    if (
      nameId !== 1 ||
      length < 1 ||
      valueOffset < storageOffset ||
      valueOffset + length > nameTableOffset + nameTableLength
    ) {
      continue;
    }
    const family = readStudioClipsFontName({
      data,
      length,
      offset: valueOffset,
      platformId,
    });
    if (/^[A-Za-z0-9 ._()+-]{1,100}$/.test(family)) {
      candidates.push({
        family,
        preferred: languageId === 0 || languageId === 0x0409,
      });
    }
  }
  const family =
    candidates.find((candidate) => candidate.preferred)?.family ??
    candidates[0]?.family;
  if (!family) failInvalidStudioClipsFont();
  return { family, format };
}
