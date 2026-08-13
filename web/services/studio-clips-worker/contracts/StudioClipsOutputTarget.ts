export type StudioClipsOutputTarget = {
  artifactId: string;
  contentType: string;
  localPath: string;
  objectKey: string;
  sizeBytes: number;
  sourceOutputId?: string;
  cleanMaster?: {
    contentType: string;
    fileName: string;
    localPath: string;
    objectKey: string;
    sizeBytes: number;
  };
};
