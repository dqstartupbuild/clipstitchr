export type StudioClipsAnalysisCandidatePayload = {
  endSeconds: number;
  id: string;
  reasoning: string[];
  score: Record<string, number>;
  startSeconds: number;
  title: string;
};
