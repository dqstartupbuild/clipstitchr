import { Box, Spacer, Text } from "ink";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import { getInteractiveShellMenuTitle } from "../interactiveShell/getInteractiveShellMenuTitle.js";

export function InteractiveTuiHeader(input: {
  menu: InteractiveShellMenu;
}) {
  return (
    <Box borderColor="magenta" borderStyle="single" paddingX={1}>
      <Text bold color="magenta">
        ClipStitchr
      </Text>
      <Text dimColor> Interactive</Text>
      <Spacer />
      <Text>{getInteractiveShellMenuTitle(input.menu)}</Text>
    </Box>
  );
}
