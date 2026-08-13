export type StudioClipsDurableOutput = {
  artifactId: string;
  contentType: string;
  objectKey: string;
  sha256: string;
  sizeBytes: number;
  sourceOutputId?: string;
  cleanMaster?: {
    contentType: string;
    objectKey: string;
    sha256: string;
    sizeBytes: number;
  };
};
