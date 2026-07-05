import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const avatarsDoc = {
  slug: "avatars",
  title: "Avatars",
  description:
    "Save reusable people or characters so Clipr and Swapr can make Hook/UGC clips without another shoot or another search for references.",
  summary:
    "Upload avatar photos, browse them, and generate new photos when the source library needs more options.",
  category: "feature",
  order: 50,
  updated: "2026-05-12",
  sections: [
    {
      title: "What an avatar is",
      body: [
        "An avatar is a saved person or character. Avatar photos are the different images you attach to that person.",
        "One avatar can have many photos with different outfits, settings, poses, and lighting. That gives Clipr and Swapr more useful references without making you create a new person every time you are already tired of the content task.",
      ],
    },
    {
      title: "Uploading avatar photos",
      body: [
        "When you upload avatar photos, assign them to a new or existing avatar. Add clear names and tags so you can find the right photo later.",
      ],
      bullets: [
        "Create a new avatar with a name when the person is new.",
        "Attach more photos to an existing avatar when you already have one saved.",
        "Browse all avatar photos or filter to a specific avatar.",
      ],
    },
    {
      title: "Generating avatar photos",
      body: [
        "Generate new photos when you need more variety. Choose how many images to make, then guide the style, lighting, scene, or action instead of hunting for another usable reference.",
      ],
    },
    {
      title: "Where avatars are used",
      body: [
        "Clipr can use an avatar as the person in a generated Clip. Swapr can use avatar photos as the person or character reference for new Hook/UGC footage.",
      ],
    },
  ],
} satisfies CustomerDocPage;
