export function createOpenAiComputerScreenshotOutput(input: {
  base64: string;
  callId: string;
}) {
  return [
    {
      call_id: input.callId,
      output: {
        detail: "original",
        image_url: `data:image/png;base64,${input.base64}`,
        type: "computer_screenshot",
      },
      type: "computer_call_output",
    },
  ];
}
