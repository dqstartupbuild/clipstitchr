import type { CliDemoAppContext } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppContext";

export type CliDemoAgentObservedElement = {
  label?: string;
  name: string;
  role: "button" | "heading" | "input" | "link" | "dialog";
};

export type CliDemoAgentPageObservation = {
  buttons: CliDemoAgentObservedElement[];
  dialogs: CliDemoAgentObservedElement[];
  headings: CliDemoAgentObservedElement[];
  inputs: CliDemoAgentObservedElement[];
  links: CliDemoAgentObservedElement[];
  title: string;
  url: string;
};

export type CliDemoAgentGuideContext = {
  goal: string;
  productId?: string;
  productName?: string;
  steps: {
    id: string;
    label: string;
    notes?: string;
  }[];
  title: string;
};

export type CliDemoAgentPlanRequest = {
  appContext?: CliDemoAppContext;
  approvedTestValueKeys: string[];
  approvedUploadFileKeys: string[];
  attemptedActionKeys: string[];
  guide?: CliDemoAgentGuideContext;
  observation: CliDemoAgentPageObservation;
  step: {
    id: string;
    label: string;
    notes?: string;
  };
};
