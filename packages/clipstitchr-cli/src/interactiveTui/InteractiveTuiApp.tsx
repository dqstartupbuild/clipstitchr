import { Box } from "ink";
import type { InteractiveTuiInput } from "./InteractiveTuiInput.js";
import { InteractiveTuiActivityLog } from "./InteractiveTuiActivityLog.js";
import { InteractiveTuiComposer } from "./InteractiveTuiComposer.js";
import { InteractiveTuiHeader } from "./InteractiveTuiHeader.js";
import { InteractiveTuiMenu } from "./InteractiveTuiMenu.js";
import { InteractiveTuiNotice } from "./InteractiveTuiNotice.js";
import { InteractiveTuiResultOutput } from "./InteractiveTuiResultOutput.js";
import { InteractiveTuiRunningView } from "./InteractiveTuiRunningView.js";
import { InteractiveTuiStatusBar } from "./InteractiveTuiStatusBar.js";
import { InteractiveTuiSuggestions } from "./InteractiveTuiSuggestions.js";
import { useInteractiveTuiController } from "./useInteractiveTuiController.js";

export function InteractiveTuiApp(input: InteractiveTuiInput) {
  const controller = useInteractiveTuiController(input);

  return (
    <>
      <InteractiveTuiActivityLog entries={controller.activities} />
      {controller.mode === "running" ? (
        <InteractiveTuiRunningView activeLabel={controller.activeLabel} />
      ) : (
        <Box flexDirection="column">
          <InteractiveTuiHeader
            context={controller.context}
            menu={controller.currentMenu}
          />
          {controller.mode === "result" ? (
            <InteractiveTuiResultOutput
              lines={controller.resultLines}
              pageSize={controller.resultPageSize}
              startIndex={controller.resultStartIndex}
            />
          ) : (
            <InteractiveTuiNotice notice={controller.notice} />
          )}
          {controller.mode === "menu" || controller.mode === "result" ? (
            <InteractiveTuiMenu
              choices={controller.choices}
              isActive
              selectedIndex={controller.selectedIndex}
            />
          ) : null}
          {controller.mode === "command" ? (
            <InteractiveTuiSuggestions
              selectedIndex={controller.suggestionIndex}
              suggestions={controller.suggestions}
            />
          ) : null}
          {controller.mode === "result" ? null : (
            <InteractiveTuiComposer
              commandText={controller.commandText}
              cursorIndex={controller.cursorIndex}
              isCommandMode={controller.mode === "command"}
            />
          )}
          <InteractiveTuiStatusBar mode={controller.mode} />
        </Box>
      )}
    </>
  );
}
