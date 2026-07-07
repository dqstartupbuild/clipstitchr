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

export type CliDemoAgentPlanRequest = {
  approvedTestValueKeys: string[];
  approvedUploadFileKeys: string[];
  attemptedActionKeys: string[];
  observation: CliDemoAgentPageObservation;
  step: {
    id: string;
    label: string;
    notes?: string;
  };
};
