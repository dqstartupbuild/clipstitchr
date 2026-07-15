# Demo Walkthrough Guides

Demo walkthrough guides are the first layer of a safer demo-agent system. They
give users a clear checklist while recording now, and they create structured
metadata that later AI-assisted editing and full browser automation can reuse.

## What It Does

`clipstitchr demo manual` can create or reuse a simple checklist before recording:

```text
1. Open the dashboard
2. Show the upload button
3. Upload or choose a sample clip
4. Show the finished Demo in the library
5. End on the result
```

The user still clicks manually. During recording, the CLI shows one step at a
time and records when each step starts and ends:

```text
Step 2 of 5: Upload or choose a sample clip. Press Enter when this step is done.
```

The upload completion request sends the saved guide and step timings with the
Demo upload. The backend stores that data in the media job input snapshot so the
media pipeline can later use it for chapters, captions, smart zoom points, and
Quick Edit decisions.

## Current User Flow

1. The user runs `clipstitchr demo manual`.
2. The CLI selects the product and local app target.
3. For web apps, the CLI scans local routes and lets the user pick the flow.
4. The CLI asks whether to create or reuse a walkthrough guide.
5. If creating a guide, the CLI asks what the demo should show.
6. The CLI creates a deterministic starter checklist from the goal and selected
   flow.
7. The guide is saved to `.clipstitchr/demo-guides/<guide-id>.json`.
8. The last guide ID is saved in `.clipstitchr.yml`.
9. The CLI prints the full guide before opening the browser or device recorder.
10. The user records manually and presses Enter after each step.
11. The CLI uploads the MP4 with click metadata, layout metadata, guide
    metadata, and step timing metadata.

## Commands

```bash
clipstitchr demo manual
clipstitchr demo manual --guide guide_123
clipstitchr demo manual --guide .clipstitchr/demo-guides/guide_123.json
clipstitchr demo manual --no-guide
clipstitchr demo manual --no-upload
```

`--guide` is useful for repeat demos and scripted product release recordings.
`--no-guide` keeps the old one-take behavior.

## Saved Guide Shape

```json
{
  "version": 1,
  "id": "guide_m5...",
  "title": "ClipStitchr walkthrough",
  "goal": "Show the upload flow",
  "source": "cli-template",
  "productId": "product_123",
  "productName": "ClipStitchr",
  "appType": "web",
  "flowName": "Show the main workspace",
  "flowPath": "/dashboard",
  "steps": [
    {
      "id": "step-1",
      "label": "Open the dashboard"
    }
  ],
  "createdAt": "2026-07-06T00:00:00.000Z",
  "updatedAt": "2026-07-06T00:00:00.000Z"
}
```

Guide files live under `.clipstitchr/demo-guides`. The `source` value is
`cli-template` for local deterministic guides, `ai-assisted` for future
ClipStitchr-generated guides, and `agent-authored` for future imported agent
instructions. The `.clipstitchr` directory should stay ignored by Git because it
can also contain recordings and browser login state.

## Upload Metadata

`POST /api/cli/uploads/demo/complete` accepts an optional `walkthrough` object:

```json
{
  "walkthrough": {
    "guide": {
      "id": "guide_m5...",
      "title": "ClipStitchr walkthrough",
      "goal": "Show the upload flow",
      "steps": []
    },
    "timings": [
      {
        "stepId": "step-1",
        "stepIndex": 0,
        "label": "Open the dashboard",
        "startedAtMs": 0,
        "completedAtMs": 12000,
        "durationMs": 12000
      }
    ]
  }
}
```

The route validates the shape, caps guide steps at 20, caps timing rows at 50,
and truncates user-provided strings before writing the media job snapshot.

## Interconnected Agent Workflow

The walkthrough guide is the shared contract for every phase:

1. Phase 1, Demo Walkthrough Guide: create a checklist from product, app type,
   selected flow, and user goal. The user records manually.
2. Phase 2, Guided Recorder: step through the checklist while recording and
   attach step timings to the upload. Web recordings also attach clicks and
   cursor movement.
3. Phase 3, AI-Assisted Script: generate a better guide from product name,
   target audience, selected route, app type, and user goal. The user reviews
   and edits the guide before recording.
4. Phase 4, Full AI Agent: the agent uses the same guide as its plan, produces
   screenshots and action logs while clicking, stops if stuck, and asks the user
   to approve the final recording before upload.

The same `walkthrough` upload metadata works for all phases. The difference is
who advances the step: the user in Phase 2, an AI-written checklist in Phase 3,
and an autonomous browser driver in Phase 4.

The full Phase 3 and Phase 4 build plan lives in
`docs/features/demo/demo-ai-guide-and-agent-plan.md`.

## Full Agent Guardrails

The full AI agent should not ship until these controls exist:

- Test or demo account credentials that cannot touch real customer data.
- A route allowlist for where the agent may navigate.
- An explicit destructive-action denylist and opt-in allowlist for anything
  that creates, deletes, spends, posts, emails, or changes billing.
- App reset or seed data so each recording starts from a known state.
- A hard max recording time and max action count.
- Stop-if-stuck behavior when the same state repeats or no useful change is
  detected.
- Screenshot capture and action logs for every step.
- User approval before upload.
- Saved browser profile support for apps where the user signs into a test
  account themselves.

## Downloadable Skill Option

ClipStitchr can later export a saved guide as an instruction file for the user's
own coding agent. That is useful for teams already using Codex, Claude Code, or
another local agent. The exported instructions should tell the agent what to
show, what routes are allowed, what actions are forbidden, when to stop, and how
to hand control back to the user.

The CLI guide remains the source of truth because it is the format that uploads
and media jobs already understand.

## Edge Cases

- No local routes found: the CLI can still create a guide from the user goal.
- User does not want a guide: `--no-guide` or the prompt keeps free-form
  recording available.
- Existing guide no longer matches the app: create a new guide and the config
  remembers the latest guide ID.
- Hand-edited guide is invalid: the list command ignores broken JSON files, and
  `--guide` reports a clear error.
- Long AI or loading process: the user can keep recording; the guide timing
  marks the waiting section so Quick Edit can treat it separately later.
- Target app requires auth: the user signs in inside the persistent recording
  browser profile or opens the native app manually before recording.
- Mobile recording: the terminal stepper works for iOS and Android too, even
  though mobile recordings do not include browser click metadata.
- Sensitive input: browser click capture does not collect typed text, cookies,
  page HTML, screenshots, or form values.

## File Tree

```text
packages/clipstitchr-cli/src/demoGuide/
  DemoWalkthroughGuide.ts
  DemoWalkthroughGuideSource.ts
  DemoWalkthroughStep.ts
  DemoWalkthroughTiming.ts
  DemoWalkthroughUploadMetadata.ts
  createDemoWalkthroughGuide.ts
  createDemoWalkthroughGuideSteps.ts
  createDemoWalkthroughGuideSortValue.ts
  createDemoWalkthroughUploadMetadata.ts
  filterDemoWalkthroughGuidesForProduct.ts
  listDemoWalkthroughGuides.ts
  printDemoWalkthroughGuide.ts
  readDemoWalkthroughGuide.ts
  readDemoWalkthroughGuideSource.ts
  readDemoWalkthroughGuideStep.ts
  readDemoWalkthroughGuideString.ts
  resolveDemoWalkthroughGuide.ts
  runDemoWalkthroughStepper.ts
  selectDemoWalkthroughGuide.ts
  writeDemoWalkthroughGuide.ts

packages/clipstitchr-cli/src/recording/
  logRecordingBrowserOpeningMessage.ts
  recordWebDemo.ts
  RecordingResult.ts
  WebRecordingOptions.ts

packages/clipstitchr-cli/src/native/
  recordAndroidDeviceDemo.ts
  recordIosSimulatorDemo.ts
  recordNativeDemo.ts

web/app/api/cli/uploads/demo/complete/route.ts

web/lib/clipstitchr/server/cli/demoWalkthrough/
  readCliDemoWalkthroughMetadata.ts
  readCliDemoWalkthroughNonnegativeNumber.ts
  readCliDemoWalkthroughGuide.ts
  readCliDemoWalkthroughStep.ts
  readCliDemoWalkthroughTiming.ts
```

## Source References

- `packages/clipstitchr-cli/src/commands/runDemoMakeCommand.ts` selects,
  prints, records, saves, and uploads guides.
- `packages/clipstitchr-cli/src/demoGuide/selectDemoWalkthroughGuide.ts`
  handles guide creation and reuse.
- `packages/clipstitchr-cli/src/demoGuide/runDemoWalkthroughStepper.ts`
  captures step timings.
- `packages/clipstitchr-cli/src/upload/uploadDemoFile.ts` forwards
  walkthrough metadata to the API.
- `web/app/api/cli/uploads/demo/complete/route.ts` stores validated walkthrough
  metadata in the media job snapshot.

## Production Notes

This first version is production-safe because it does not let an agent click
through user apps. The remaining production work is mostly release work:

- Deploy the web app so the upload completion route accepts `walkthrough`.
- Publish the bumped CLI package to npm.
- Run an end-to-end `clipstitchr demo manual` against production with a guided
  upload.
- Confirm the created media job snapshot includes `walkthrough`.
- Decide when the media worker should start using walkthrough timings for
  chapters, captions, and smart zoom keyframes.
