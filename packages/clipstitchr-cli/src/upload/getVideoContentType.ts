import { extname } from "node:path";

const videoContentTypes = new Map([
  [".m4v", "video/x-m4v"],
  [".mov", "video/quicktime"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
]);

export function getVideoContentType(filePath: string) {
  return videoContentTypes.get(extname(filePath).toLowerCase()) ?? "video/mp4";
}
