export type QuickEditDetectorSource = {
  cleanup?: () => Promise<void>;
  input: string;
};
