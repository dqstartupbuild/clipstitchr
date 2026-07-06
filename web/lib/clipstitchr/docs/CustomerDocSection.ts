import type { CustomerDocCard } from "@/lib/clipstitchr/docs/CustomerDocCard";

export type CustomerDocSection = {
  title: string;
  body: string[];
  bullets?: string[];
  cards?: CustomerDocCard[];
  commands?: string[];
};
