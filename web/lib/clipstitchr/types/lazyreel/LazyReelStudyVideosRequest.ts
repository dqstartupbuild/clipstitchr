export type LazyReelStudyVideosRequest = {
  hookPattern?: string;
  limit?: number;
  niche?: string;
  query?: string;
  tool: "study_videos";
  videoFormat?: string;
};
