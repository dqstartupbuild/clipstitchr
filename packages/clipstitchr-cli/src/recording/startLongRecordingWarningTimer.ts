import { logWarning } from "../terminal/logWarning.js";
import { formatRecordingDuration } from "./formatRecordingDuration.js";

export function startLongRecordingWarningTimer(warningAfterSeconds: number) {
  if (!Number.isFinite(warningAfterSeconds) || warningAfterSeconds <= 0) {
    return () => undefined;
  }

  const timer = setTimeout(() => {
    logWarning(
      `This demo is getting long. Keep recording if the app is still working. ClipStitchr can cut waiting time later. (${formatRecordingDuration(warningAfterSeconds)})`,
    );
  }, warningAfterSeconds * 1000);

  timer.unref?.();

  return () => clearTimeout(timer);
}
