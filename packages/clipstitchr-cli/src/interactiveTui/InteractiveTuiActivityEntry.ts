export type InteractiveTuiActivityEntry = {
  id: number;
  kind: "command" | "error" | "success";
  message: string;
};
