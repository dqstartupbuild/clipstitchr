import type { QueueMenuChoice } from "./QueueMenuChoice.js";

export function createQueueMenuChoices(): QueueMenuChoice[] {
  return [
    {
      name: "Show upcoming queue",
      value: "list",
    },
    {
      name: "Queue latest Stitch",
      value: "stitch-latest",
    },
    {
      name: "Queue all Stitches",
      value: "stitch-all",
    },
    {
      name: "Queue latest Swipe",
      value: "swipe-latest",
    },
    {
      name: "Queue all Swipes",
      value: "swipe-all",
    },
    {
      name: "Queue everything",
      value: "all",
    },
    {
      name: "Queue a specific Stitch",
      value: "stitch-id",
    },
    {
      name: "Queue a specific Swipe",
      value: "swipe-id",
    },
  ];
}
