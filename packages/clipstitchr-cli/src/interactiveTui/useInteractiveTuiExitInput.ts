import { useInput } from "ink";

export function useInteractiveTuiExitInput(input: {
  isActive: boolean;
  onExit: () => void;
}) {
  useInput(
    (typedInput, key) => {
      if (key.ctrl && typedInput === "c") {
        input.onExit();
      }
    },
    { isActive: input.isActive },
  );
}
