export type LazyReelTeardownData =
  | {
      confidence: "low" | "medium" | "high";
      input: string;
      mode: "video";
      narrative: {
        framework: string;
        hookPattern: string;
        orderedBeats: string[];
      };
      replication: string[];
      sourceMatch: null | {
        framework: string;
        hookPattern: string;
        niche: string;
        url: string;
        videoFormat: string | null;
        views: number;
        viewsPerFollower: number;
      };
    }
  | {
      brief: {
        angle: string;
        beats: Array<{
          beat: string;
          broll: string;
          onScreenText: string;
          voiceover: string;
        }>;
        framework: string;
        hooks: string[];
      };
      examples: string[];
      mode: "product";
      model: {
        id: string;
        name: string;
        notes: string[];
        promptGrammar: string;
      };
      niche: string;
      product: string;
      trend: {
        formula: string | null;
        name: string;
        videoFormat: string;
        whyItTravels: string | null;
      };
    };
