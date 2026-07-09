export type DemoAgentPolicyEditorPrompts = {
  confirm: (input: { default: boolean; message: string }) => Promise<boolean>;
  input: (input: { default: string; message: string }) => Promise<string>;
};
