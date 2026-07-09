export type CliOpenAiComputerRelayScreenshotInput = [
  {
    call_id: string;
    output: {
      detail: "original";
      image_url: string;
      type: "computer_screenshot";
    };
    type: "computer_call_output";
  },
];

export type CliOpenAiComputerRelayRequest = {
  callIndex: number;
  input: string | CliOpenAiComputerRelayScreenshotInput;
  model: string;
  previousResponseId?: string;
  runId: string;
  runStartedAt: string;
};
