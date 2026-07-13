# Why Did This Ad Work? Breakdown Template

## What It Does

`/tools/why-did-this-ad-work-template` is a browser-local worksheet for
reviewing one short-form app ad without turning assumptions into facts. It
captures source context, observable creative beats, performance evidence when
available, separate inferences, one transferable principle, and one controlled
follow-up hypothesis.

## Implementation

`whyDidThisAdWorkDefinition.ts` owns the five worksheet sections and thirteen
review tasks. The shared `GuidedResourcePage` renders checkable progress and
notes, builds copyable Markdown, and downloads the completed worksheet. Notes
remain in React state and are not uploaded, stored, or sent to analytics.

## Use Cases and Boundary

- Review an ad before a creative retrospective.
- Separate evidence from a persuasive explanation.
- Reuse an abstract pattern without copying media, wording, or brand assets.

The template does not import or transcribe video, attribute performance, prove
why an ad worked, or store a teardown library. ClipStitchr's paid workflow still
handles source assets and production.

## File Tree

```text
web/app/(content)/tools/why-did-this-ad-work-template/page.tsx
web/lib/clipstitchr/tools/whyDidThisAdWork/whyDidThisAdWorkDefinition.ts
```

The candid status and next refinement live in
`docs/features/public-tool-quality-register.md`.
