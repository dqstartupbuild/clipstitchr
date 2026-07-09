# Demo Guide Readable Names

Saved CLI walkthrough guides include a readable `name` alongside the stable
guide ID. The name is generated from the selected flow first, then the guide
goal or title. Existing guide files without a name still load with a fallback
name, so older local guides keep working.

## How It Works

- New guides are saved with `name`.
- `demo guide list` shows the name first and includes the stable ID.
- `show`, `edit`, `delete`, manual recording, automated recording, and
  instruction export resolve guides by name, ID, or file path.
- If two guides share the same name, the CLI stops and lists the matching names
  and IDs so the user can choose an exact ID.

## Relevant Files

- `packages/clipstitchr-cli/src/demoGuide/DemoWalkthroughGuide.ts`
- `packages/clipstitchr-cli/src/demoGuide/createDemoWalkthroughGuideName.ts`
- `packages/clipstitchr-cli/src/demoGuide/readDemoWalkthroughGuide.ts`
- `packages/clipstitchr-cli/src/demoGuide/resolveDemoWalkthroughGuide.ts`
- `packages/clipstitchr-cli/src/demoGuide/resolveDemoWalkthroughGuidePath.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideListCommand.ts`

## Use Cases

Readable names make saved guides easier to scan and reuse from Terminal. Users
can run commands like `clipstitchr demo guide show "Checkout flow"` or
`clipstitchr demo agent run --guide "Checkout flow"` while scripts can keep
using stable IDs and file paths. `demo guide create` is the primary creation
command, with `demo guide generate` kept as an alias for older scripts.
