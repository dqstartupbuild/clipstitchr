import type { StudioReelWorkerError } from "../errors/StudioReelWorkerError";

export type StudioReelCommandProcessState = {
  bytes: number;
  child: { kill: (signal: NodeJS.Signals) => boolean };
  maximumOutputBytes: number;
  reject: (reason: StudioReelWorkerError) => void;
  resolve: (value: { stderr: string; stdout: string }) => void;
  settled: boolean;
  stderr: Buffer[];
  stdout: Buffer[];
  timeout?: ReturnType<typeof setTimeout>;
};
