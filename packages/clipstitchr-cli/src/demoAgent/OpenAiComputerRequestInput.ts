export type OpenAiComputerRequestInput = {
  apiKey?: string;
  input: unknown;
  model: string;
  previousResponseId?: string;
};
