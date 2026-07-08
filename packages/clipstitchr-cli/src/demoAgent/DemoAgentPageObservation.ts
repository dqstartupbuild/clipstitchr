import type { DemoAgentObservedElement } from "./DemoAgentObservedElement.js";

export type DemoAgentPageObservation = {
  buttons: DemoAgentObservedElement[];
  canScrollDown: boolean;
  canScrollUp: boolean;
  dialogs: DemoAgentObservedElement[];
  headings: DemoAgentObservedElement[];
  inputs: DemoAgentObservedElement[];
  links: DemoAgentObservedElement[];
  title: string;
  url: string;
};
