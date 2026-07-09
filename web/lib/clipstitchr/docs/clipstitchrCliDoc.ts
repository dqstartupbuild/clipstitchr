import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const clipstitchrCliDoc = {
  slug: "clipstitchr-cli",
  title: "ClipStitchr CLI",
  description:
    "Record demos, start new content, and queue ready work from your terminal.",
  summary:
    "Install one command, connect your account, capture demos, create batches, and send ready work to the queue.",
  category: "start",
  order: 1,
  updated: "2026-07-09",
  sections: [
    {
      title: "What it does",
      body: [
        "The ClipStitchr CLI brings the parts of ClipStitchr that fit naturally in Terminal into the repo you already have open. You can record guided local product demos, upload existing demos, start new content, and add ready work to the queue.",
        "Use it when you changed the product, need a cleaner walkthrough, want to kick off a batch without opening the dashboard, or need ready content queued from a script.",
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
        "clipstitchr help demo manual",
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
        "Status shows the account, repo, product, local app, and recording browser in one quick view. Scan looks for likely product flows in the local app. Doctor checks the pieces the recorder needs, including native recording tools when the repo looks like iOS, Android, or React Native. Run clipstitchr native init once per Mac when you want AI to control a visible macOS window, then clipstitchr native check when you need to verify permissions. On Windows, browser demos still work, but native visible-window control is not available yet. Update checks npm for a newer CLI.",
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
      title: "Start new drafts",
      body: [
        "You can start new content from Terminal after your clips, demos, products, and saved settings are ready in ClipStitchr. Stitchr uses recent Hook/UGC clips and Demo clips. Swipr uses your saved dashboard settings.",
      ],
      bullets: [
        "Stitchr creates finished Stitch tasks in the background.",
        "Swipr queues editable Swipe drafts in the background.",
        "Open the dashboard to review, edit, and approve the finished drafts.",
      ],
      commands: [
        "clipstitchr stitchr new",
        "clipstitchr stitchr new --product product_123",
        "clipstitchr stitchr new --template template_123 --product product_123",
        "clipstitchr swipr new",
        "clipstitchr swipr new --product product_123",
      ],
    },
    {
      title: "Find and queue content",
      body: [
        "Run clipstitchr queue when you want the focused queue menu. Queue adds ready active work to your Post Bridge queue, using the connected accounts saved on the product unless you pass account IDs yourself. Dashboard Library browsing remains the best way to inspect saved clips, Stitches, and Swipes.",
      ],
      bullets: [
        "Queue does not ask for a date or time.",
        "Queue list shows queued Stitches and Swipes coming up in the next 24 hours.",
        "A Stitch needs a finished rendered video before it can be queued.",
        "A Swipe needs a saved rendered image before the CLI can queue it.",
        "Use --all to queue active items one at a time. If one item fails, the CLI shows what queued and what needs attention.",
        "Open the dashboard when you need to review the full Library or render and queue the full Swipe carousel or video version.",
      ],
      commands: [
        "clipstitchr queue",
        "clipstitchr queue list",
        "clipstitchr queue stitch",
        "clipstitchr queue stitch stitch_123 --caption \"New demo is live\"",
        "clipstitchr queue stitch --all",
        "clipstitchr queue swipe",
        "clipstitchr queue swipe swipe_123 --accounts 123,456",
        "clipstitchr queue swipe --all",
        "clipstitchr queue --all",
        "clipstitchr queue stitch stitch_123 --accounts 123,456",
      ],
    },
    {
      title: "Let AI write and record the demo",
      body: [
        "After the repo is linked, your ClipStitchr account is connected, and the saved browser is already signed into your app, one command can write the guide and record the demo.",
        "The command asks what you want to demonstrate, picks the linked product, uses the local app URL, writes a short AI guide, creates a local safety policy if needed, records with the guarded AI agent, and saves the MP4 plus evidence locally. It does not upload automatically.",
      ],
      bullets: [
        "Use --goal when you want to skip the prompt and pass the demo request directly.",
        "Use --audience when you want the guide written for a specific viewer.",
        "Use --steps to keep the guide between 3 and 8 steps.",
        "Use --product, --start, or --url only when the linked repo settings are missing or need an override.",
      ],
      commands: [
        "clipstitchr demo agent",
        "clipstitchr demo agent --goal \"Show the upload flow\"",
        "clipstitchr demo agent --audience \"busy founders\" --steps 5",
        "clipstitchr demo agent --product product_123 --url http://localhost:3000",
      ],
    },
    {
      title: "Record a demo",
      body: [
        "Run clipstitchr to open the main menu, choose Record a demo, then pick Record it myself or Let AI record it for me. Run clipstitchr demo when you want the focused demo menu for recording, AI recording, guides, safety policy setup, uploads, and logs.",
        "The CLI can create a quick walkthrough checklist first, then starts your local app, opens the recording browser, and walks you through the steps while you record.",
        "Each time a step is done, return to the terminal and press Enter. ClipStitchr saves those step timings with the upload so it can make cleaner chapters, captions, zooms, and edits later.",
        "If the app asks you to sign in, log in inside the recording browser. The CLI keeps that browser session for the same repo, so the next recording is faster.",
        "Most demos work best around 30-90 seconds, but longer recordings are allowed. If your app needs time for loading, AI generation, or processing, keep recording and ClipStitchr can cut waiting time later.",
      ],
      bullets: [
        "Use --guide when you want to reuse a saved walkthrough.",
        "Use --no-guide when you want one free-form recording.",
        "Use --no-upload when you only want the local MP4.",
        "Use --output when you want to choose where the MP4 is saved.",
        "Use --product, --start, or --url when you want to skip prompts.",
      ],
      commands: [
        "clipstitchr demo",
        "clipstitchr demo manual",
        "clipstitchr demo manual --guide guide_123",
        "clipstitchr demo manual --no-guide",
        "clipstitchr demo manual --no-upload",
        "clipstitchr demo manual --output ./demo.mp4",
        "clipstitchr demo manual --product product_123 --url http://localhost:3000",
        "clipstitchr demo manual --start \"cd web && npm run dev\"",
      ],
    },
    {
      title: "Create walkthrough guides",
      body: [
        "Guide commands help you prepare the checklist before recording. You can ask ClipStitchr to draft a short guide, review it, edit the steps, save it for the next take, or export simple instructions for a trusted local helper.",
        "Saved guides have readable names, so you can type a guide name instead of copying a generated ID. List shows the name first, and show, edit, delete, manual recording, and agent recording can use a name, ID, or file path.",
        "Guide commands do not click through your app, ask for passwords, or upload anything by themselves. The separate local agent beta is the only command that can try guarded browser actions.",
        "Exported instructions are local Markdown files only. They are not uploaded, published, or sent anywhere. Use them when a teammate is recording for you, when another trusted local tool needs the plan, when you want to review the steps before recording, when you need to share the guide without sharing account access, or when you want to archive the plan next to the matching safety policy.",
      ],
      bullets: [
        "Generate asks what the demo should show, then saves the guide in this repo.",
        "List and show help you find a saved guide name or ID.",
        "Edit lets you clean up labels before recording.",
        "Delete removes a guide you do not need anymore.",
        "Export instructions creates one Markdown checklist file from the saved guide.",
        "Keep exported instructions with the safety policy when another recorder or local tool will follow them.",
      ],
      commands: [
        "clipstitchr demo guide create",
        "clipstitchr demo guide list",
        "clipstitchr demo guide show \"Checkout flow\"",
        "clipstitchr demo guide edit \"Checkout flow\"",
        "clipstitchr demo guide delete guide_123",
        "clipstitchr demo guide save-instructions guide_123",
      ],
    },
    {
      title: "Try the local agent beta",
      body: [
        "The local demo agent beta helps you check a guide against your app before using a guarded recording run. Start with the safety policy. The CLI shows the current settings, lets you accept safe defaults, and lets you edit allowed app URLs, pages, test values, blocked words, upload files, and recording limits.",
        "Localhost app URLs are allowed by default. Live or staging URLs need a separate yes before they are allowed. File uploads stay off unless you choose the exact local files the agent may use.",
        "Run clipstitchr demo agent to let the CLI create a guide and record it, or pass --guide when you want to use an existing guide. ClipStitchr asks you to review the recording, screenshots, and action log before any upload starts. Add --no-upload when you only want the local MP4, or --upload when you already know you want the finished recording uploaded.",
      ],
      bullets: [
        "Use a test account when the app asks you to sign in.",
        "Keep the generated policy and run logs inside .clipstitchr.",
        "Never use it for account creation, purchases, deletion, publishing, or production accounts.",
      ],
      commands: [
        "clipstitchr demo policy init",
        "clipstitchr demo policy check",
        "clipstitchr demo policy edit",
        "clipstitchr demo agent",
        "clipstitchr demo agent --guide guide_123",
        "clipstitchr demo agent --guide guide_123 --ai-planner",
        "clipstitchr demo agent --guide guide_123 --no-upload",
        "clipstitchr demo agent --guide guide_123 --upload",
        "clipstitchr demo logs agent_run_123",
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
        "Web app demos are recorded at a full desktop size, then prepared for vertical ads with a fit-with-background layout. ClipStitchr can also use your guide steps and clicks to add smooth zooms around the parts of the product you touched.",
        "The CLI warns when a recording gets long, but it does not stop web or iOS recordings for you. Android manual recording may stop around 3 minutes because it uses the device recorder through adb screenrecord.",
        "iOS, Android, and React Native manual demos record from an already-open simulator, emulator, or device. Open the app where you want to start, then let the CLI start and stop the recording.",
        "AI native control is different from manual recording. Today it can control visible iOS Simulator, iPhone Mirroring, Android emulator, and desktop app windows on macOS through the macOS window helper. Direct Android ADB AI control and Windows native window control are future adapter plans, not current features.",
      ],
    },
    {
      title: "Where the files go",
      body: [
        "The CLI saves repo settings in .clipstitchr.yml, saved walkthroughs in .clipstitchr/demo-guides, and local recording files in .clipstitchr. Keep .clipstitchr ignored by Git so recordings and browser login state stay off your repo.",
      ],
    },
  ],
} satisfies CustomerDocPage;
