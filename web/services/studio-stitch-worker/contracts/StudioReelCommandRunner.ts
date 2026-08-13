export type StudioReelCommandRunner = (input: {
  readonly args: readonly string[];
  readonly command: string;
  readonly cwd: string;
  readonly maximumOutputBytes?: number;
  readonly timeoutMs: number;
}) => Promise<{ readonly stderr: string; readonly stdout: string }>;
