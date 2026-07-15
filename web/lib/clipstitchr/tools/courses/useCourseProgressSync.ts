"use client";

import { useEffect, useRef, useState } from "react";
import type { CourseKey } from "@/lib/clipstitchr/tools/courses/CourseKey";
import { requestCourseProgressReset } from "@/lib/clipstitchr/tools/courses/requestCourseProgressReset";
import { requestCourseProgressUpdate } from "@/lib/clipstitchr/tools/courses/requestCourseProgressUpdate";

export function useCourseProgressSync(
  courseKey: CourseKey | null,
  enabled: boolean,
) {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  function saveItem(
    itemId: string,
    completed: boolean,
    note: string,
    immediate = false,
  ) {
    if (!enabled || !courseKey) return;
    const existingTimer = timers.current.get(itemId);
    if (existingTimer) clearTimeout(existingTimer);

    const save = async () => {
      timers.current.delete(itemId);
      setStatus("saving");

      try {
        await requestCourseProgressUpdate(courseKey, {
          completed,
          itemId,
          note,
        });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    };

    if (immediate) {
      void save();
    } else {
      timers.current.set(itemId, setTimeout(() => void save(), 700));
    }
  }

  async function reset() {
    if (!enabled || !courseKey) return;
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
    setStatus("saving");

    try {
      await requestCourseProgressReset(courseKey);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return { reset, saveItem, status };
}
