export type PexelsPhotoResult = {
  id: number;
  alt: string;
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
  width: number;
  height: number;
  src: {
    large: string;
    large2x: string;
    medium: string;
    original: string;
    portrait: string;
    small: string;
  };
};
