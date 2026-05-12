import type { ImageDimensions } from "@/lib/clipstitchr/media/getImageDimensions";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function readUint16(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint32(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] * 0x1000000 +
    ((bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3])
  );
}

function isPng(bytes: Uint8Array) {
  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

function isJpegStartOfFrameMarker(marker: number) {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

function readPngDimensions(bytes: Uint8Array): ImageDimensions {
  if (bytes.length < 24 || !isPng(bytes)) {
    throw new Error("Unable to read PNG dimensions.");
  }

  return {
    width: readUint32(bytes, 16),
    height: readUint32(bytes, 20),
  };
}

function readJpegDimensions(bytes: Uint8Array): ImageDimensions {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error("Unable to read JPEG dimensions.");
  }

  let offset = 2;

  while (offset < bytes.length) {
    while (bytes[offset] === 0xff) {
      offset += 1;
    }

    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    if (offset + 2 > bytes.length) {
      break;
    }

    const segmentLength = readUint16(bytes, offset);

    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      break;
    }

    if (isJpegStartOfFrameMarker(marker)) {
      return {
        height: readUint16(bytes, offset + 3),
        width: readUint16(bytes, offset + 5),
      };
    }

    offset += segmentLength;
  }

  throw new Error("Unable to read JPEG dimensions.");
}

export function readImageDimensionsFromBytes(
  bytes: ArrayBuffer,
  contentType?: string,
): ImageDimensions {
  const imageBytes = new Uint8Array(bytes);

  if (contentType?.includes("png") || isPng(imageBytes)) {
    return readPngDimensions(imageBytes);
  }

  return readJpegDimensions(imageBytes);
}
