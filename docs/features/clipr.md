# Clipr

Clipr creates short engagement videos from a saved product profile and a saved
avatar photo. The output is not an ad for ClipStitchr and does not include a
call to action. It should work as a standalone social clip or as a UGC-style
source clip inside Stitchr.

## Product Intent

Clipr is inspired by ClipsPal-style hook systems: a curated hook library,
product context, audience context, and a short script generator. The useful part
is not a generic "make video" button. The useful part is a repeatable content
strategy system:

1. Choose a hook style.
2. Fill a reusable template with product and audience context.
3. Expand the hook into a short engagement script.
4. Turn that script into a talking avatar video.
5. Save the output back into the content library.

Clipr should create engagement content for the user's business, not promotional
content for ClipStitchr. Generated scripts must avoid app-promotion CTAs,
"try it now" endings, download prompts, and platform-specific asks. The clip
can end with a useful point, a question, or an open loop, but not a direct sales
CTA.

## ClipsPal Reference Model

The current Clipr hook library was drafted from the public ClipsPal-style
pattern documented in the original research notes that previously lived in this
file:

- A hook/content system is mostly template-driven.
- Hooks are grouped by psychological intent, such as curiosity, expertise,
  contrarian takes, insider knowledge, callouts, transformations, warnings,
  FOMO, proof, predictions, experiments, shock, confessions, challenges, and
  storytime.
- Product details, audience details, language, and tone are used to adapt a
  reusable hook template into a finished short-form script.
- The most reusable primitive is: hook archetype -> personalized angle ->
  talking points -> script -> generated video.

Clipr copies that strategy pattern, not ClipsPal's product. The starter hook
styles and templates are original ClipStitchr resources.

## Non-User-Facing Hook Resources

Hook styles and templates must not be selectable in the UI. Every Clipr, Swipr,
or Stitchr auto-generation request randomly selects from the internal resources
and uses the selected product profile to fill the template.

The resource files are:

- `web/lib/clipstitchr/resources/cliprHookStyles.ts`
- `web/lib/clipstitchr/resources/cliprHookTemplates.ts`

The original style set contains 15 internal styles mapped from the public hook
genre pattern:

| Style key | Style name | Intent |
| --- | --- | --- |
| `mystery_gap` | Mystery Gap | Create an unanswered question the viewer wants resolved. |
| `authority_signal` | Authority Signal | Borrow credibility from expertise, research, data, or experience. |
| `anti_advice` | Anti-Advice | Challenge the obvious, popular, or default advice. |
| `inside_room` | Inside Room | Reveal hidden rules, incentives, or behind-the-scenes knowledge. |
| `direct_diagnosis` | Direct Diagnosis | Name the viewer's behavior problem or blind spot directly. |
| `before_after_arc` | Before/After Arc | Show movement from a bad state to a better state. |
| `cost_alert` | Cost Alert | Make the viewer feel the cost of continuing a mistake. |
| `deadline_pull` | Deadline Pull | Create urgency around timing, opportunity, or missed advantage. |
| `receipt_stack` | Receipt Stack | Use evidence, results, examples, or tests to support the claim. |
| `future_cast` | Future Cast | Show what is likely to happen next and why it matters. |
| `test_drive` | Test Drive | Show what happened after trying, comparing, or testing something. |
| `pattern_break` | Pattern Break | Open with a surprising result, stat, contrast, or outcome. |
| `vulnerable_reveal` | Vulnerable Reveal | Admit something honest, uncomfortable, or personal. |
| `viewer_dare` | Viewer Dare | Pull the viewer into a challenge or self-test. |
| `cold_open_story` | Cold Open Story | Start inside a specific moment that needs resolution. |

## User Workflow

1. The user opens `/dashboard/clipr`.
2. The user chooses a saved Settings product.
3. The user chooses a saved avatar photo.
4. The user chooses a duration: 30 seconds by default or 60 seconds max.
5. The user chooses a voice from a modal-style dropdown.
6. The user can mark a voice as the default for future Clipr generations.
7. The user confirms they have rights and consent for the avatar photo.
8. Clipr generates the script, voice audio, talking video, and final saved clip.
9. The saved output appears in the Content Library under the Clips tab.
10. The same saved Clipr output can be selected in Stitchr anywhere UGC clips are
    accepted.

The MVP does not expose 90-second generation because Clipr output is capped at
60 seconds.

## Generation Pipeline

Clipr uses the selected product profile as the strategy context:

- Product name.
- Product details.
- Audience details.
- Hidden inferred problem.
- Hidden inferred pain points.

The generation flow is:

1. Server selects one random internal hook style and one random matching hook
   template.
2. GPT-4.1 through Replicate fills the hook placeholders from the selected
   product settings as private audience context and writes a no-CTA engagement
   script that is useful to the audience rather than promotional.
3. The script is sent to `elevenlabs/v3` through Replicate with the selected
   voice.
4. The generated audio is sent to `kwaivgi/kling-avatar-v2` through Replicate
   with the selected avatar photo and an animation prompt.
5. The server returns after creating the Kling prediction so the browser can
   poll for completion without holding a long Vercel function open.
6. The generated video is downloaded through an authenticated output proxy.
7. The browser normalizes the video to TikTok 9:16 with Media Bunny.
8. If the normalized output is materially shorter than the requested duration,
   Clipr requests a follow-up segment and repeats the same audio/video path.
9. When multiple segments are needed, Media Bunny stitches the normalized
   segments into one final vertical video.
10. The browser generates a poster image.
11. The final video and poster are uploaded to R2.
12. Convex saves the generated clip as a UGC-compatible video clip with a
    system `clipr` tag.

The final output should have audio, a generated poster, a default trim range
covering the full clip, and normalized 9:16 dimensions.

## Provider Models

Default model IDs:

- Hook and script generation: `openai/gpt-4.1`
- Text to speech: `elevenlabs/v3`
- Talking avatar video: `kwaivgi/kling-avatar-v2`

Environment overrides should be supported:

- `CLIPR_SCRIPT_MODEL_ID`
- `CLIPR_TTS_MODEL_ID`
- `CLIPR_AVATAR_MODEL_ID`

The Kling Avatar V2 request uses:

- `image`: selected avatar photo.
- `audio`: ElevenLabs output audio URL.
- `prompt`: concise avatar delivery guidance.
- `mode`: `std` for MVP speed and cost control.

The ElevenLabs request uses:

- `prompt`: generated script text.
- `voice`: selected voice.
- `language_code`: `en`.
- `speed`: `1`.
- `stability`: `0.5`.
- `similarity_boost`: `0.75`.
- `style`: `0.25`.

## Voice Selection

Voice selection should feel like a compact modal dropdown, not a long form. The
MVP can ship with a small static voice list from the Replicate model's supported
voice names. The selected value is sent to `elevenlabs/v3`.

The dropdown includes:

- Current voice label.
- Voice options.
- A `Make default` option that stores the selected voice locally for the next
  Clipr session.

The default voice is `Rachel` until the user chooses another default.

## Library Behavior

The Content Library includes a new Clips tab. The tab filters generated Clipr
outputs from the same `videoClips` table used by UGC and Swapr outputs.

Generated Clipr outputs:

- Use `clipType: "ugc"` so Stitchr can select them as UGC-style clips.
- Include the system tag `clipr`.
- Appear in the Clips tab.
- Are excluded from the plain UGC tab so the user can separate uploaded UGC from
  generated engagement clips.
- Still appear in the All tab.
- Can be renamed, tagged, trimmed, previewed, downloaded, deleted, and used in
  Stitchr like other video clips.

## Swipr And Stitchr Hook Generation

The same non-user-facing hook resources power text generation in Swipr and
Stitchr.

Swipr:

- Uses the selected Settings product.
- Randomly selects an internal hook style and template.
- Generates one short text line per slide.
- Fills the existing slide text overlays.
- Does not expose the selected style or template to the user.

Stitchr:

- Lets the user choose a Settings product for generated overlay text.
- Randomly selects an internal hook style and template.
- Generates one short overlay line for the current Stitchr batch.
- Places that line into the existing single text overlay workflow.
- Does not expose the selected style or template to the user.

## Abuse Protection

Clipr adds cost surfaces:

- GPT-4.1 script generation.
- ElevenLabs voice generation.
- Kling Avatar V2 video generation.
- Replicate output proxying.
- R2 upload URLs and bytes for saved final outputs.
- Convex saves for generated clips.

Required enforcement:

- Rate-limit Clipr segment generation before the GPT-4.1 script call.
- Count estimated generated seconds before the Kling Avatar call.
- Record Clipr Replicate jobs in Convex for ownership checks.
- Rate-limit Clipr segment polling and verify the prediction belongs to the
  authenticated user before polling Replicate.
- Rate-limit Clipr output proxy requests and verify the output URL belongs to
  the authenticated user's recorded Clipr video job.
- Use existing R2 signed upload limits before saving final videos and posters.
- Use existing Convex record-save limits before saving generated clips.

## MVP Constraints

- Clipr generates engagement clips only.
- No CTA is generated for Clipr clips.
- Durations are 30 seconds or 60 seconds.
- A 30-second clip is the default.
- The MVP uses one selected avatar photo per generation.
- Hook style and template selection is always random and hidden.
- The MVP does not include scheduling, captions, music, or multi-avatar scenes.
- Generated outputs are saved as reusable UGC-compatible clips, not as a
  separate media type.
