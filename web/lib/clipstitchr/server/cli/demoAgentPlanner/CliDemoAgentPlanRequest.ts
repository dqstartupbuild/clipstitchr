import type { CliDemoAppContext } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppContext";

export type CliDemoAgentObservedElement = {
  disabled?: boolean;
  label?: string;
  name: string;
  placeholder?: string;
  role: "button" | "heading" | "input" | "link" | "dialog";
  selected?: boolean;
  value?: string;
};

export type CliDemoAgentPageObservation = {
  buttons: CliDemoAgentObservedElement[];
  canScrollDown: boolean;
  canScrollUp: boolean;
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
