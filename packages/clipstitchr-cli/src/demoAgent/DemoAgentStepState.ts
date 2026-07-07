export type DemoAgentStepState = {
  attemptedActionKeys: Set<string>;
  hasClicked: boolean;
  hasScreenshot: boolean;
  hasTyped: boolean;
  hasWaited: boolean;
};
