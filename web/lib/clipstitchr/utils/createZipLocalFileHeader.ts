type CreateZipLocalFileHeaderOptions = {
  nameBytes: Uint8Array;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  dosDate: number;
  dosTime: number;
};

export function createZipLocalFileHeader({
  nameBytes,
  crc32,
  compressedSize,
  uncompressedSize,
  dosDate,
  dosTime,
}: CreateZipLocalFileHeaderOptions) {
  const header = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, dosTime, true);
  view.setUint16(12, dosDate, true);
  view.setUint32(14, crc32, true);
  view.setUint32(18, compressedSize, true);
  view.setUint32(22, uncompressedSize, true);
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true);
  header.set(nameBytes, 30);

  return header;
}
