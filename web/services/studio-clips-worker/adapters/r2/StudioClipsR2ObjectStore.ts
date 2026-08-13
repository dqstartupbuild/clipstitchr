export type StudioClipsR2ObjectProof = {
  etag: string;
  key: string;
  sha256Base64: string;
  sha256Hex: string;
  sizeBytes: number;
  versionId?: string;
};

export type StudioClipsR2ObjectStore = {
  downloadFile: (input: {
    contentType: string;
    expectedEtag?: string;
    key: string;
    maximumBytes: number;
    outputPath: string;
    sizeBytes: number;
  }) => Promise<{ sha256Hex: string }>;
  getBytes: (input: {
    key: string;
    maximumBytes: number;
    sha256Hex: string;
    sizeBytes: number;
  }) => Promise<Uint8Array>;
  inspectFile: (input: { key: string }) => Promise<{
    contentType: string;
    etag: string;
    sizeBytes: number;
    versionId?: string;
  }>;
  putBytesVerified: (input: {
    body: Uint8Array;
    contentType: string;
    key: string;
  }) => Promise<StudioClipsR2ObjectProof>;
  putFileVerified: (input: {
    contentType: string;
    key: string;
    localPath: string;
    maximumBytes: number;
    sizeBytes: number;
  }) => Promise<StudioClipsR2ObjectProof>;
};
