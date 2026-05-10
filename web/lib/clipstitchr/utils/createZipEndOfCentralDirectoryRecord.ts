type CreateZipEndOfCentralDirectoryRecordOptions = {
  entryCount: number;
  centralDirectorySize: number;
  centralDirectoryOffset: number;
};

export function createZipEndOfCentralDirectoryRecord({
  entryCount,
  centralDirectorySize,
  centralDirectoryOffset,
}: CreateZipEndOfCentralDirectoryRecordOptions) {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return record;
}
