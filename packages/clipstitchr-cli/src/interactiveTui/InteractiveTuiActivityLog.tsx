import { Box, Static } from "ink";
import type { InteractiveTuiActivityEntry } from "./InteractiveTuiActivityEntry.js";
import { InteractiveTuiActivityItem } from "./InteractiveTuiActivityItem.js";

export function InteractiveTuiActivityLog(input: {
  entries: InteractiveTuiActivityEntry[];
}) {
  return (
    <Static items={input.entries}>
      {(entry) => (
        <Box key={entry.id}>
          <InteractiveTuiActivityItem entry={entry} />
        </Box>
      )}
    </Static>
  );
}
