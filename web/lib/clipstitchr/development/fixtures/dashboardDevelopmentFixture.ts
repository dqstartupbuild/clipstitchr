export const dashboardDevelopmentFixture = {
  stats: [
    { label: "UGC clips", value: "8" },
    { label: "Product demos", value: "3" },
    { label: "Finished Stitches", value: "14" },
  ],
  recentWork: [
    {
      detail: "Ready to pair with a product demo",
      kind: "UGC clip",
      name: "Morning routine reaction",
    },
    {
      detail: "Draft saved with shared caption",
      kind: "Stitch",
      name: "Problem to proof cut",
    },
    {
      detail: "7 slides ready for scheduling",
      kind: "Swipe",
      name: "Three mistakes carousel",
    },
  ],
} as const;
