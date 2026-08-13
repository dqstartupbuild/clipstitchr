export type StudioClipsAnalysis = {
  candidates: Array<{
    endSeconds: number;
    id: string;
    outputId?: string;
    reasoning: string[];
    score: {
      clarity?: number;
      hook?: number;
      overall: number;
      retention?: number;
      shareability?: number;
    };
    startSeconds: number;
    title?: string;
  }>;
  schemaVersion: "studio-clips-analysis-v1";
  summary?: string;
  transcriptExcerpts: Array<{
    endSeconds: number;
    startSeconds: number;
    text: string;
  }>;
};
