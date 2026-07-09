import { format, stripVTControlCharacters } from "node:util";

export async function captureInteractiveTuiActionOutput<T>(input: {
  onOutput: (lines: string[]) => void;
  run: () => Promise<T>;
}) {
  const lines: string[] = [];
  const originalError = console.error;
  const originalLog = console.log;
  const originalWarn = console.warn;

  console.error = (...values: unknown[]) => {
    lines.push(
      ...stripVTControlCharacters(format(...values)).split(/\r?\n/),
    );
  };
  console.log = (...values: unknown[]) => {
    lines.push(
      ...stripVTControlCharacters(format(...values)).split(/\r?\n/),
    );
  };
  console.warn = (...values: unknown[]) => {
    lines.push(
      ...stripVTControlCharacters(format(...values)).split(/\r?\n/),
    );
  };

  try {
    return await input.run();
  } finally {
    console.error = originalError;
    console.log = originalLog;
    console.warn = originalWarn;
    input.onOutput(lines);
  }
}
