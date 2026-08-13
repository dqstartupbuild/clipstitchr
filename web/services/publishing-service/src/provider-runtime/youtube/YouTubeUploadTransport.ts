import type { YouTubeUploadProgress } from "./YouTubeUploadProgress.js";
import type { YouTubeVideoMetadata } from "./YouTubeVideoMetadata.js";

export interface YouTubeUploadTransport {
  initiate(input: Readonly<{
    accessToken: string;
    contentType: "video/mp4";
    metadata: YouTubeVideoMetadata;
    totalBytes: number;
  }>): Promise<string>;
  probe(input: Readonly<{
    accessToken: string;
    sessionUri: string;
    totalBytes: number;
  }>): Promise<YouTubeUploadProgress>;
  uploadRange(input: Readonly<{
    accessToken: string;
    contentType: "video/mp4";
    endOffsetInclusive: number;
    mediaUrl: string;
    sessionUri: string;
    startOffset: number;
    totalBytes: number;
  }>): Promise<YouTubeUploadProgress>;
  uploadThumbnail(input: Readonly<{
    accessToken: string;
    byteLength: number;
    contentType: "image/jpeg" | "image/png";
    mediaUrl: string;
    videoId: string;
  }>): Promise<void>;
}
