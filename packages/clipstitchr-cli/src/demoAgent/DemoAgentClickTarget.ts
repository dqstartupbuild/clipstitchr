export type DemoAgentClickTarget = {
  label?: string;
  name?: string;
  role?:
    | "button"
    | "checkbox"
    | "combobox"
    | "link"
    | "menuitem"
    | "tab"
    | "textbox";
  text?: string;
};
