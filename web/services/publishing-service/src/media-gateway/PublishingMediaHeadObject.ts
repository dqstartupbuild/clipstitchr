export type PublishingMediaHeadObject = Readonly<{
  byteLength: number;
  checksumSha256?: string;
  contentType: string;
  etag?: string;
  versionId?: string;
}>;
