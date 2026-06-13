import type { CliprVideoModelOption } from "@/lib/clipstitchr/types/CliprVideoModelOption";

export const cliprVideoModelOptions: CliprVideoModelOption[] = [
  {
    id: "auto",
    label: "Auto",
    modes: ["script", "reaction", "broll"],
  },
  {
    id: "prunaai/p-video-avatar",
    label: "Pruna avatar",
    modes: ["script"],
  },
  {
    id: "kwaivgi/kling-v3-video",
    label: "Kling v3",
    modes: ["reaction", "broll"],
  },
  {
    id: "google/veo-3.1",
    label: "Veo 3.1",
    modes: ["reaction", "broll"],
  },
];
