import type { DemoAgentObservedElement } from "./DemoAgentObservedElement.js";

export type DemoAgentPageObservation = {
  buttons: DemoAgentObservedElement[];
  dialogs: DemoAgentObservedElement[];
  headings: DemoAgentObservedElement[];
  inputs: DemoAgentObservedElement[];
  links: DemoAgentObservedElement[];
  title: string;
  url: string;
};
