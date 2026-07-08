export type DemoAgentObservedElement = {
  disabled?: boolean;
  label?: string;
  name: string;
  placeholder?: string;
  role: "button" | "heading" | "input" | "link" | "dialog";
  selected?: boolean;
  value?: string;
};
