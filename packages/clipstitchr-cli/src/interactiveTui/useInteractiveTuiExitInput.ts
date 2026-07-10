import { useInput } from "ink";
import { useStableInteractiveTuiInputHandler } from "./useStableInteractiveTuiInputHandler.js";

export function useInteractiveTuiExitInput(input: {
  isActive: boolean;
  onExit: () => void;
}) {
  const handleInput = useStableInteractiveTuiInputHandler(
    (typedInput, key) => {
      if (key.ctrl && typedInput === "c") {
        input.onExit();
      }
    },
  );
  useInput(handleInput, { isActive: input.isActive });
}
