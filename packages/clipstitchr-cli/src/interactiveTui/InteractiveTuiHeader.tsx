import { Box, Spacer, Text } from "ink";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import type { InteractiveShellContext } from "../interactiveShell/InteractiveShellContext.js";
import { getInteractiveShellMenuTitle } from "../interactiveShell/getInteractiveShellMenuTitle.js";
import { getInteractiveTuiContextText } from "./getInteractiveTuiContextText.js";

export function InteractiveTuiHeader(input: {
  context?: InteractiveShellContext;
  menu: InteractiveShellMenu;
}) {
  return (
    <Box
      borderColor="magenta"
      borderStyle="single"
      flexDirection="column"
      paddingX={1}
    >
      <Box>
        <Text bold color="magenta">
          ClipStitchr
        </Text>
        <Text dimColor> Interactive</Text>
        <Spacer />
        <Text>{getInteractiveShellMenuTitle(input.menu)}</Text>
      </Box>
      {input.context ? (
        <Text dimColor>{getInteractiveTuiContextText(input.context)}</Text>
      ) : null}
    </Box>
  );
}
