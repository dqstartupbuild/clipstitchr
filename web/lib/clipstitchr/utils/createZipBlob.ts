import type { ZipFileEntry } from "@/lib/clipstitchr/types/ZipFileEntry";
import { createZipCentralDirectoryHeader } from "@/lib/clipstitchr/utils/createZipCentralDirectoryHeader";
import { createZipEndOfCentralDirectoryRecord } from "@/lib/clipstitchr/utils/createZipEndOfCentralDirectoryRecord";
import { createZipLocalFileHeader } from "@/lib/clipstitchr/utils/createZipLocalFileHeader";
import { encodeZipString } from "@/lib/clipstitchr/utils/encodeZipString";
import { getCrc32 } from "@/lib/clipstitchr/utils/getCrc32";
import { getZipDosDateTime } from "@/lib/clipstitchr/utils/getZipDosDateTime";

type CentralDirectoryFile = {
  header: Uint8Array;
};

export async function createZipBlob(files: ZipFileEntry[]) {
  const parts: BlobPart[] = [];
  const centralDirectoryFiles: CentralDirectoryFile[] = [];
  let offset = 0;

  for (const file of files) {
    const fileBuffer = await file.blob.arrayBuffer();
    const bytes = new Uint8Array(fileBuffer);
    const nameBytes = encodeZipString(file.name);
    const crc32 = getCrc32(bytes);
    const modified = getZipDosDateTime(file.lastModified ?? new Date());
    const localHeader = createZipLocalFileHeader({
      nameBytes,
      crc32,
      compressedSize: bytes.byteLength,
      uncompressedSize: bytes.byteLength,
      dosDate: modified.date,
      dosTime: modified.time,
    });
    const centralHeader = createZipCentralDirectoryHeader({
      nameBytes,
      crc32,
      compressedSize: bytes.byteLength,
      uncompressedSize: bytes.byteLength,
      localHeaderOffset: offset,
      dosDate: modified.date,
      dosTime: modified.time,
    });

    parts.push(localHeader.buffer as ArrayBuffer, fileBuffer);
    centralDirectoryFiles.push({ header: centralHeader });
    offset += localHeader.byteLength + bytes.byteLength;
  }

  const centralDirectoryOffset = offset;
  const centralDirectorySize = centralDirectoryFiles.reduce(
    (size, file) => size + file.header.byteLength,
    0,
  );

  centralDirectoryFiles.forEach((file) => {
    parts.push(file.header.buffer as ArrayBuffer);
  });

  const endRecord = createZipEndOfCentralDirectoryRecord({
    entryCount: files.length,
    centralDirectorySize,
    centralDirectoryOffset,
  });

  parts.push(endRecord.buffer as ArrayBuffer);

  return new Blob(parts, { type: "application/zip" });
}
