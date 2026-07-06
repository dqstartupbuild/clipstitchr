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
      title: "Install and open it",
      body: [
        "Install the command once from npm. After that, run clipstitchr from any product repo you want to connect.",
      ],
      commands: ["npm install -g clipstitchr", "clipstitchr"],
    },
    {
      title: "Help and version",
      body: [
        "Use these when you want to check what is installed or see the latest command options from your terminal. Add --plain when you want uncolored output for logs or screenshots.",
      ],
      commands: [
        "clipstitchr --help",
        "clipstitchr help",
        "clipstitchr help demo make",
        "clipstitchr --version",
        "clipstitchr --plain status",
      ],
    },
    {
      title: "Connect your account",
      body: [
        "Login connects this machine to your ClipStitchr account. The CLI shows a short code, opens ClipStitchr in your browser, and waits while you sign in. In the browser, make sure the code matches the one in Terminal, then connect the machine. Logout removes the saved machine session.",
      ],
      commands: ["clipstitchr login", "clipstitchr logout"],
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
      commands: ["clipstitchr link", "clipstitchr init"],
    },
    {
      title: "Check and update setup",
      body: [
        "Status shows the account, repo, product, local app, and recording browser in one quick view. Scan looks for likely product flows in the local app. Doctor checks the pieces the recorder needs, including native recording tools when the repo looks like iOS, Android, or React Native. Update checks npm for a newer CLI.",
      ],
      commands: [
        "clipstitchr status",
        "clipstitchr scan",
        "clipstitchr doctor",
        "clipstitchr update",
      ],
    },
    {
      title: "Change the linked repo",
      body: [
        "Unlink removes this repo connection without logging the whole machine out of ClipStitchr. It can also remove this repo's saved recording browser session and local recordings if you choose that during the prompt.",
      ],
      commands: ["clipstitchr unlink"],
    },
    {
      title: "Manage products",
      body: [
        "List products when you need the IDs for scripting. Create adds a new product to your ClipStitchr account. Use saves the product this repo should record against.",
      ],
      commands: [
        "clipstitchr products list",
        "clipstitchr products create",
        "clipstitchr products create --use",
        "clipstitchr products use",
        "clipstitchr products use product_123",
      ],
    },
    {
      title: "Record a demo",
      body: [
        "Choose Make a product demo. The CLI starts your local app, opens the recording browser, and tells you when to walk through the product. When the take is done, return to the terminal and press Enter.",
        "If the app asks you to sign in, log in inside the recording browser. The CLI keeps that browser session for the same repo, so the next recording is faster.",
      ],
      bullets: [
        "Use --no-upload when you only want the local MP4.",
        "Use --output when you want to choose where the MP4 is saved.",
        "Use --product, --start, or --url when you want to skip prompts.",
      ],
      commands: [
        "clipstitchr demo make",
        "clipstitchr demo make --no-upload",
        "clipstitchr demo make --output ./demo.mp4",
        "clipstitchr demo make --product product_123 --url http://localhost:3000",
        "clipstitchr demo make --start \"cd web && npm run dev\"",
      ],
    },
    {
      title: "Upload an existing demo",
      body: [
        "Already have a recording? Upload the file directly and ClipStitchr will process it like any other Demo clip.",
      ],
      bullets: [
        "Use --no-wait when you want to leave processing running in ClipStitchr.",
        "Use --product when you already know the product ID.",
      ],
      commands: [
        "clipstitchr demo upload ./demo.mp4",
        "clipstitchr demo upload ./demo.mp4 --no-wait",
        "clipstitchr demo upload ./demo.mp4 --product product_123",
      ],
    },
    {
      title: "Use another ClipStitchr app URL",
      body: [
        "Most users do not need this. Use --api when testing against a local or preview ClipStitchr web app.",
      ],
      commands: [
        "clipstitchr --api http://localhost:3000 login",
        "clipstitchr --api https://your-preview-url.example.com link",
        "clipstitchr --api https://your-preview-url.example.com products list",
      ],
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
