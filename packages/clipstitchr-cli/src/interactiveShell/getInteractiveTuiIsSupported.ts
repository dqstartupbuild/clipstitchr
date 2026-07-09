import { getTerminalColumnCount } from "./getTerminalColumnCount.js";

export function getInteractiveTuiIsSupported(input: {
  columns?: number;
  isTty?: boolean;
  noColor?: boolean;
  plain?: boolean;
  plainEnv?: boolean;
}) {
  const columns = getTerminalColumnCount(input.columns);
  const isTty = input.isTty ?? Boolean(process.stdout.isTTY);
  const noColor = input.noColor ?? Boolean(process.env.NO_COLOR);
  const plainEnv =
    input.plainEnv ?? process.env.CLIPSTITCHR_PLAIN === "1";

  return Boolean(isTty && columns >= 56 && !input.plain && !plainEnv && !noColor);
}
