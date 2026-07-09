export type InteractiveShellNotice = {
  kind: "error" | "info" | "success";
  message: string;
};
