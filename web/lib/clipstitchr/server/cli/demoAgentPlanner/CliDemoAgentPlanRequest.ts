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
  steps: {
    id: string;
    label: string;
    notes?: string;
  }[];
  title: string;
};

export type CliDemoAgentPlanRequest = {
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
