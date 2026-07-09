export type InteractiveTuiOutputStream = {
  isTTY?: boolean;
  write: (value: string) => unknown;
};
