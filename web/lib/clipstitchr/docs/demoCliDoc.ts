import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const demoCliDoc = {
  slug: "demo-cli",
  title: "Demo CLI",
  description:
    "Record a product demo from your local app and send it to ClipStitchr without opening a video editor first.",
  summary:
    "Install one command, connect your account, record the product flow, and save the demo in your library.",
  category: "start",
  order: 1,
  updated: "2026-07-06",
  sections: [
    {
      title: "What it does",
      body: [
        "The ClipStitchr CLI records your local product in a clean browser window, uploads the take, and saves it as a Demo clip. It is built for app founders who need fresh product footage without exporting files from a screen recorder.",
        "Use it when you changed the product, need a cleaner walkthrough, or want ClipStitchr to turn a wide web demo into a vertical-ready clip with a background instead of cutting off the screen.",
      ],
    },
    {
      title: "Install it",
      body: [
        "Install the command once from npm. After that, you can run it from any product repo you want to connect.",
      ],
      commands: ["npm install -g clipstitchr", "clipstitchr"],
    },
    {
      title: "Connect a repo",
      body: [
        "Run the command from the folder where your app lives. The CLI opens a short setup, connects your ClipStitchr account, finds common app folders like web, and saves the local run settings in the repo.",
      ],
      bullets: [
        "Choose Connect this repo to ClipStitchr.",
        "Pick the product the demo belongs to.",
        "Confirm the start command if the CLI found one.",
        "Confirm the local URL to record.",
      ],
    },
    {
      title: "Record a demo",
      body: [
        "Choose Make a product demo. The CLI starts your local app, opens the recording browser, and tells you when to walk through the product. When the take is done, return to the terminal and press Enter.",
        "If the app asks you to sign in, log in inside the recording browser. The CLI keeps that browser session for the same repo, so the next recording is faster.",
      ],
      commands: ["clipstitchr demo make"],
    },
    {
      title: "Upload an existing demo",
      body: [
        "Already have a recording? Upload the file directly and ClipStitchr will process it like any other Demo clip.",
      ],
      commands: ["clipstitchr demo upload ./demo.mp4"],
    },
    {
      title: "What to expect",
      body: [
        "Web app demos are recorded at a full desktop size, then prepared for vertical ads with a fit-with-background layout. ClipStitchr can also use your clicks to add smooth zooms around the parts of the product you touched.",
        "iOS, Android, and React Native demos record from an already-open simulator, emulator, or device. Open the app where you want to start, then let the CLI start and stop the recording.",
      ],
    },
    {
      title: "Where the files go",
      body: [
        "The CLI saves repo settings in .clipstitchr.yml and local recording files in .clipstitchr. Keep .clipstitchr ignored by Git so recordings and browser login state stay off your repo.",
      ],
    },
  ],
} satisfies CustomerDocPage;
