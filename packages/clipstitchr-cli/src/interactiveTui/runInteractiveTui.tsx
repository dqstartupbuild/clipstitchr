import { render } from "ink";
import { interactiveTuiActiveEnvironmentVariable } from "../config/interactiveTuiActiveEnvironmentVariable.js";
import type { InteractiveTuiInput } from "./InteractiveTuiInput.js";
import { InteractiveTuiApp } from "./InteractiveTuiApp.js";
import { setInteractiveTuiStdinIsReferenced } from "./setInteractiveTuiStdinIsReferenced.js";

export async function runInteractiveTui(input: InteractiveTuiInput) {
  const previousTuiActiveValue =
    process.env[interactiveTuiActiveEnvironmentVariable];
  process.env[interactiveTuiActiveEnvironmentVariable] = "1";

  try {
    const instance = render(<InteractiveTuiApp {...input} />, {
      exitOnCtrlC: false,
    });

    await instance.waitUntilExit();
  } finally {
    setInteractiveTuiStdinIsReferenced({ isReferenced: false });

    if (previousTuiActiveValue === undefined) {
      delete process.env[interactiveTuiActiveEnvironmentVariable];
    } else {
      process.env[interactiveTuiActiveEnvironmentVariable] =
        previousTuiActiveValue;
    }
  }
}
