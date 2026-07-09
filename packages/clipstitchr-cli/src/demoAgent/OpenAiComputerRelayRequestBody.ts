export type OpenAiComputerRelayRequestBody = {
  callIndex: number;
  input: unknown;
  model: string;
  previousResponseId?: string;
  runId: string;
  runStartedAt: string;
};
