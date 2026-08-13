export type StudioClipsYouTubeNavigationPolicy = {
  assertRedirect: (input: {
    fromUrl: string;
    redirectCount: number;
    toUrl: string;
  }) => URL;
  maxRedirects: number;
  readUrl: (value: string) => URL;
};
