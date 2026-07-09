import { render } from "ink";
import { interactiveTuiActiveEnvironmentVariable } from "../config/interactiveTuiActiveEnvironmentVariable.js";
import type { InteractiveTuiInput } from "./InteractiveTuiInput.js";
import { InteractiveTuiApp } from "./InteractiveTuiApp.js";
import { enterInteractiveTuiScreen } from "./enterInteractiveTuiScreen.js";
import { exitInteractiveTuiScreen } from "./exitInteractiveTuiScreen.js";
import { setInteractiveTuiStdinIsReferenced } from "./setInteractiveTuiStdinIsReferenced.js";

export async function runInteractiveTui(input: InteractiveTuiInput) {
  const previousTuiActiveValue =
    process.env[interactiveTuiActiveEnvironmentVariable];
  process.env[interactiveTuiActiveEnvironmentVariable] = "1";
  enterInteractiveTuiScreen();

  try {
    const instance = render(<InteractiveTuiApp {...input} />, {
      exitOnCtrlC: false,
    });

    await instance.waitUntilExit();
  } finally {
    setInteractiveTuiStdinIsReferenced({ isReferenced: false });
    exitInteractiveTuiScreen();

    if (previousTuiActiveValue === undefined) {
      delete process.env[interactiveTuiActiveEnvironmentVariable];
    } else {
      process.env[interactiveTuiActiveEnvironmentVariable] =
        previousTuiActiveValue;
    }
  }
}
