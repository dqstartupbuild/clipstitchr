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
    id: "bytedance/seedance-2.0",
    label: "Seedance 2.0",
    modes: ["reaction", "broll"],
  },
  {
    id: "google/veo-3.1",
    label: "Veo 3.1",
    modes: ["reaction", "broll"],
  },
  {
    id: "openai/sora-2",
    label: "Sora 2",
    modes: ["reaction", "broll"],
  },
  {
    id: "openai/sora-2-pro",
    label: "Sora 2 Pro",
    modes: ["reaction", "broll"],
  },
];
