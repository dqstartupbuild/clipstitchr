import { render } from "ink";
import type { InteractiveTuiInput } from "./InteractiveTuiInput.js";
import { InteractiveTuiApp } from "./InteractiveTuiApp.js";

export async function runInteractiveTui(input: InteractiveTuiInput) {
  const instance = render(<InteractiveTuiApp {...input} />, {
    exitOnCtrlC: false,
  });

  await instance.waitUntilExit();
}
