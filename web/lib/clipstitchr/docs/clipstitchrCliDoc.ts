import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const clipstitchrCliDoc = {
  slug: "clipstitchr-cli",
  title: "ClipStitchr CLI",
  description:
    "Record demos, start batch content, check your library, and queue finished Stitches from your terminal.",
  summary:
    "Install one command, connect your account, capture demos, create batches, and send ready work to the queue.",
  category: "start",
  order: 1,
  updated: "2026-07-06",
  sections: [
    {
      title: "What it does",
      body: [
        "The ClipStitchr CLI brings the parts of ClipStitchr that fit naturally in Terminal into the repo you already have open. You can record guided local product demos, upload existing demos, start batch content, list saved work, and add finished Stitches to the queue.",
        "Use it when you changed the product, need a cleaner walkthrough, want to kick off a batch without opening the dashboard, or need a finished Stitch queued from a script.",
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
      title: "Create batch drafts",
      body: [
        "You can start batch content from Terminal after your clips, demos, products, and batch settings are ready in ClipStitchr. Stitchr uses recent Hook/UGC clips and Demo clips. Swipr uses your saved dashboard batch settings.",
      ],
      bullets: [
        "Stitchr creates finished Stitch tasks in the background.",
        "Swipr queues editable Swipe drafts in the background.",
        "Open the dashboard to review, edit, and approve the finished drafts.",
      ],
      commands: [
        "clipstitchr stitchr batch",
        "clipstitchr stitchr batch --product product_123",
        "clipstitchr stitchr batch --template template_123 --product product_123",
        "clipstitchr swipr batch",
        "clipstitchr swipr batch --product product_123",
      ],
    },
    {
      title: "Find and queue content",
      body: [
        "Library commands show the IDs you need for scripts. Queue adds a finished Stitch to your Post Bridge queue, using the connected accounts saved on the product unless you pass account IDs yourself.",
      ],
      bullets: [
        "Queue does not ask for a date or time.",
        "The Stitch needs a finished rendered video before it can be queued.",
        "Swipe queueing still happens in the dashboard because Swipes are rendered in the browser before posting.",
      ],
      commands: [
        "clipstitchr library clips --kind demo",
        "clipstitchr library stitches --ready",
        "clipstitchr library swipes",
        "clipstitchr queue stitch",
        "clipstitchr queue stitch stitch_123 --caption \"New demo is live\"",
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
        "clipstitchr demo auto",
        "clipstitchr demo auto --goal \"Show the upload flow\"",
        "clipstitchr demo auto --audience \"busy founders\" --steps 5",
        "clipstitchr demo auto --product product_123 --url http://localhost:3000",
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
        "Start with a dry-run. When the evidence looks right, run it without --dry-run to save a recording. ClipStitchr asks you to review the recording, screenshots, and action log before any upload starts. Add --ai-planner only when you want ClipStitchr AI to propose actions.",
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
        "clipstitchr demo agent init",
        "clipstitchr demo agent check",
        "clipstitchr demo agent run --guide guide_123 --dry-run",
        "clipstitchr demo agent run --guide guide_123 --ai-planner --dry-run",
        "clipstitchr demo agent run --guide guide_123",
        "clipstitchr demo agent run --guide guide_123 --no-upload",
        "clipstitchr demo agent export-log agent_run_123",
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
        "The CLI warns when a recording gets long, but it does not stop web or iOS recordings for you. Android recording may stop around 3 minutes because of the device recorder.",
        "iOS, Android, and React Native demos record from an already-open simulator, emulator, or device. Open the app where you want to start, then let the CLI start and stop the recording.",
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
