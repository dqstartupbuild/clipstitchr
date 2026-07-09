import { useCallback, useRef, useState } from "react";
import type { InteractiveTuiActivityEntry } from "./InteractiveTuiActivityEntry.js";

export function useInteractiveTuiActivity() {
  const [activities, setActivities] = useState<InteractiveTuiActivityEntry[]>([]);
  const nextActivityId = useRef(1);

  const appendActivity = useCallback(
    (kind: InteractiveTuiActivityEntry["kind"], message: string) => {
      const entry = {
        id: nextActivityId.current,
        kind,
        message,
      } satisfies InteractiveTuiActivityEntry;

      nextActivityId.current += 1;
      setActivities((current) => [...current, entry]);
    },
    [],
  );

  return { activities, appendActivity };
}
