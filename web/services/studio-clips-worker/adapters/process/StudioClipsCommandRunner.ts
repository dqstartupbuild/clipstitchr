export type StudioClipsCommandResult = {
  stderr: string;
  stdout: string;
};

export type StudioClipsCommandRunner = (input: {
  args: readonly string[];
  command: string;
  cwd: string;
  maximumOutputBytes?: number;
  timeoutMs: number;
}) => Promise<StudioClipsCommandResult>;
