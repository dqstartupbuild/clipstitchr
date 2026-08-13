export const studioClipsAnalysisJsonSchema = {
  additionalProperties: false,
  properties: {
    brollOpportunities: {
      items: {
        additionalProperties: false,
        properties: {
          candidateIndex: { minimum: 0, type: "integer" },
          durationSeconds: { maximum: 5, minimum: 2, type: "number" },
          searchTerm: { maxLength: 120, minLength: 1, type: "string" },
          startSeconds: { minimum: 0, type: "number" },
        },
        required: [
          "candidateIndex",
          "durationSeconds",
          "searchTerm",
          "startSeconds",
        ],
        type: "object",
      },
      maxItems: 5,
      type: "array",
    },
    candidates: {
      items: {
        additionalProperties: false,
        properties: {
          endSeconds: { minimum: 0, type: "number" },
          reasoning: {
            items: { maxLength: 1_000, minLength: 1, type: "string" },
            maxItems: 5,
            minItems: 1,
            type: "array",
          },
          score: {
            additionalProperties: false,
            properties: {
              clarity: { maximum: 100, minimum: 0, type: "number" },
              hook: { maximum: 100, minimum: 0, type: "number" },
              overall: { maximum: 100, minimum: 0, type: "number" },
              retention: { maximum: 100, minimum: 0, type: "number" },
              shareability: { maximum: 100, minimum: 0, type: "number" },
            },
            required: [
              "clarity",
              "hook",
              "overall",
              "retention",
              "shareability",
            ],
            type: "object",
          },
          startSeconds: { minimum: 0, type: "number" },
          title: { maxLength: 200, minLength: 1, type: "string" },
        },
        required: ["endSeconds", "reasoning", "score", "startSeconds", "title"],
        type: "object",
      },
      maxItems: 5,
      minItems: 1,
      type: "array",
    },
    summary: { maxLength: 4_000, minLength: 1, type: "string" },
  },
  required: ["brollOpportunities", "candidates", "summary"],
  type: "object",
} as const;
