export type SwaprOutpaintInputs = {
  imageBlob: Blob;
  maskBlob: Blob;
  sourceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
