# Clipr Scope

> Status: implementation scope
> Goal: define the Clipr feature, internal hook resources, implementation touchpoints, rate limits, durable workflow, and review plan.

## Summary

Clipr is a new ClipStitchr feature for generating reusable short-form engagement clips.
It is inspired by ClipsPal's public hook-category strategy, but Clipr must use
original ClipStitchr hook styles and templates, hidden from users as internal
resources.

Clipr is not a direct-promo generator. Generated Clipr clips are meant to create
engagement around the user's audience, problem space, opinions, stories, tests,
or educational angles. They must not include a CTA. They can be downloaded as
standalone clips and must be saved into the Content Library and used in Stitchr the same
way UGC clips are used.

The implementation must also extend the hook system to Swipr slide text and
Stitchr text overlays so selected product settings can drive auto-generated
copy across Clips, Swipes, and Stitches. The first Swipr slide should use the
hook, and the remaining slides should pay it off with simple supporting points.

## Product Rules

- Product name: `Clipr`.
- Output name in the library: `Clips`.
- Clipr outputs are UGC-compatible source clips, but they have separate Clipr
  provenance and appear in a new Content Library `Clips` tab.
- Clipr clips must not promote ClipStitchr.
- Clipr clips must not directly promote the user's product. All content is for
  audience engagement in a non-promotional way.
- Clipr clips must not include CTAs such as "try it", "download it", "save
  this", "comment", "follow", "buy", "book", or "sign up".
- Advice-style hooks can name a behavior or mistake, but generated scripts must
  not ask viewers to take a platform, sales, or app action.
- Product settings still matter: the saved product profile supplies audience,
  pain points, vocabulary, and topical relevance for hook selection.
- Each product should store an eligible pool of hook styles/templates and a
  reusable set of placeholder fillers. Each generation randomly selects from
  that product-specific eligible pool.
- Each generated job stores the exact hook style, template, filled variables,
  and script used. Exact recreation should use the saved job metadata, not a new
  random selection.
- When the user adds a new product, the analysis phase should save which hook
  styles and templates best fit the product, plus a comprehensive list of
  fillers for template placeholders.
- The UI should never expose hook style names, template IDs, risk labels, or
  placeholder mechanics to users.
- Default video length is 30 seconds.
- The user can choose 30 seconds or 60 seconds.
- Generated videos can be up to 60 seconds.
- The user selects an avatar to use as the character reference. They should not
  have to select a specific image; the system should automatically use that
  avatar's most recent photo for character consistency.
- The user selects a voice through a modal-style dropdown.
- The voice selector includes `Make default`.
- Saved default voice should be reused on later Clipr jobs.
- Clipr should generate multiple short scene clips from a script, then stitch
  them together.
- Scenes should be generated one at a time using a few script lines per scene.
- Some scenes should show the selected avatar.
- Some scenes should be b-roll.
- Generated scenes must get as close as possible to the target length of 30 or
  60 seconds. Track each generated scene duration, generate follow-up scenes
  when the total is short, and trim the stitched final output with Media Bunny
  when the total runs over the selected target.
- Media Bunny should be used to stitch generated scenes into the final 9:16
  output.
- Final Clipr outputs should be saved in the content library and organized into a "Clips" tab.

## Documentation Coverage

Clipr affects these docs:

- `docs/features/clipr.md`
  - Overwrite it with the full Clipr feature scope.
  - Include the hook/template engine, generation pipeline, voice selection,
    scene stitching, library behavior, data model, rate limits, and MVP limits.
- `project-scope.md`
  - Add Clipr to feature requirements, routes, Content Library tabs, AI-assisted
    content supply, data model, phases, and success criteria.
  - Update old "no external services" language so it reflects the existing and
    planned paid-provider AI workflows.
- `docs/features/swipr.md`
  - Add auto-generated slide text from the shared hook-template engine.
  - Explain that selected product settings drive hidden template selection.
  - Keep rendered slide export behavior unchanged.
- `docs/features/stitchr.md`
  - Add optional auto-generated text overlays from the shared hook-template
    engine.
  - Explain that the generated overlay is editable and one shared overlay still
    applies to the Stitchr batch.
- `docs/product/positioning.md`
  - Add Clipr as a secondary source-creation workflow.
  - Keep Stitchr as the primary product promise.
  - Position Clipr as engagement content that feeds the library, not as an
    AI-first replacement for strategy or editing.
- `docs/product/copywriting-guide.md`
  - Add Clipr feature copy, UI copy rules, and copy constraints.
  - Use clear, low-hype copy.
  - Avoid technical/provider language in user-facing copy.
- `docs/backend/rate-limits.md`
  - Add all Clipr paid-provider and backend surfaces.
  - Document per-user and global limits before provider calls.
  - Document output-seconds limits for 30s and 60s Clipr jobs.
  - Document which local Media Bunny work is not rate-limited and why.
- `docs/backend/durable-workflows.md`
  - Add Clipr as a multi-provider durable job workflow.
  - Require provider outputs to be copied to R2 before provider retention expires.
  - Require recoverable final stitching from saved scene outputs.

## Internal Resource Files

Create a root `resources/` folder if it does not exist.

Create these non-user-facing files:

- `resources/clipr/hook-styles.csv`
  - Stores the 15 starter hook styles.
- `resources/clipr/hook-templates.csv`
  - Stores the 150 starter hook templates.
- `resources/clipr/hook-style-rules.md`
  - Stores style-by-style generation rules.
- `resources/clipr/hook-template-generation-prompt.md`
  - Stores the master prompt for generating more templates later.

Implementation can then expose typed runtime data through one-file-one-purpose
modules under `web/lib/clipstitchr/resources/clipr/` or
`web/lib/clipstitchr/constants/clipr/`, depending on the cleanest local pattern.

The resources must stay internal:

- no UI for selecting styles
- no UI for selecting templates
- no UI for viewing template IDs
- no user-facing mention of ClipsPal

## Hook Styles Seed Data

```csv
style_key,style_name,source_category,core_intent
mystery_gap,Mystery Gap,Curiosity,Create an unanswered question the viewer wants resolved
authority_signal,Authority Signal,Expertise,Borrow credibility from expertise research data or experience
anti_advice,Anti-Advice,Contrarian,Challenge the obvious popular or default advice
inside_room,Inside Room,Insider,Reveal hidden rules incentives or behind-the-scenes knowledge
direct_diagnosis,Direct Diagnosis,Callout,Name the viewer's behavior problem or blind spot directly
before_after_arc,Before/After Arc,Transformation,Show a clear movement from bad state to better state
cost_alert,Cost Alert,Warning,Make the viewer feel the cost of continuing a mistake
deadline_pull,Deadline Pull,FOMO,Create urgency around timing opportunity or missed advantage
receipt_stack,Receipt Stack,Proof,Use evidence results examples or tests to support the claim
future_cast,Future Cast,Prediction,Show what is likely to happen next and why it matters
test_drive,Test Drive,Experiment,Show what happened after trying comparing or stress-testing something
pattern_break,Pattern Break,Shock,Open with a surprising result stat contrast or unexpected outcome
vulnerable_reveal,Vulnerable Reveal,Confession,Admit something honest uncomfortable or personal
viewer_dare,Viewer Dare,Challenge,Dare the viewer to prove skill knowledge or self-awareness
cold_open_story,Cold Open Story,Storytime,Start inside a specific moment that needs resolution
```

## Hook Template Seed Data

These are original ClipStitchr starter templates. They are mapped from public
hook category patterns but must not be treated as copied ClipsPal content.

```csv
style_key,template_id,template
mystery_gap,MG-001,"The thing nobody tells you about {{topic}}"
mystery_gap,MG-002,"I finally figured out why {{audience}} struggle with {{problem}}"
mystery_gap,MG-003,"This one small part of {{task}} matters more than you think"
mystery_gap,MG-004,"Most people skip this before they try {{goal}}"
mystery_gap,MG-005,"This looks like {{problem}}, but it is really {{real_problem}}"
mystery_gap,MG-006,"I changed one thing in {{routine}}, and it got weird"
mystery_gap,MG-007,"The first sign that {{problem}} is getting worse"
mystery_gap,MG-008,"I wish I knew this before paying for {{thing}}"
mystery_gap,MG-009,"The real reason {{problem}} keeps happening"
mystery_gap,MG-010,"What happens when you stop doing {{old_step}}"
authority_signal,AS-001,"I looked at {{number}} examples of {{topic}}, and one thing stood out"
authority_signal,AS-002,"A good {{role}} checks this before starting {{task}}"
authority_signal,AS-003,"The best {{audience}} do this before making {{decision}}"
authority_signal,AS-004,"Here is how smart {{audience}} avoid {{mistake}}"
authority_signal,AS-005,"Once you understand {{idea}}, {{topic}} gets simpler"
authority_signal,AS-006,"This is what separates new {{audience}} from better ones"
authority_signal,AS-007,"I kept seeing the same mistake in {{examples}}"
authority_signal,AS-008,"The smart move before {{action}} is this"
authority_signal,AS-009,"Here is a better way to think about {{problem}}"
authority_signal,AS-010,"Most advice about {{topic}} skips the simple part"
anti_advice,AA-001,"The common advice about {{topic}} is not helping {{audience}}"
anti_advice,AA-002,"You do not need more {{thing}}. You need {{better_thing}}"
anti_advice,AA-003,"Everyone says {{common_advice}}, but that is not the whole story"
anti_advice,AA-004,"Stop chasing {{wrong_goal}} if you want {{result}}"
anti_advice,AA-005,"{{audience}} are trying to fix the wrong problem"
anti_advice,AA-006,"The thing helping your {{goal}} might be slowing you down"
anti_advice,AA-007,"Fix {{big_problem}} before worrying about {{small_detail}}"
anti_advice,AA-008,"The easier way to do {{task}} might be better"
anti_advice,AA-009,"Most {{audience}} do not need this trendy {{thing}}"
anti_advice,AA-010,"Doing less of {{bad_habit}} might fix more than doing more"
inside_room,IR-001,"The quiet rule good {{audience}} follow with {{topic}}"
inside_room,IR-002,"What really happens before {{result}}"
inside_room,IR-003,"The part of {{topic}} beginners never hear about"
inside_room,IR-004,"Why {{thing}} feels harder than it should"
inside_room,IR-005,"What actually happens after you {{action}}"
inside_room,IR-006,"Why {{situation}} feels so confusing"
inside_room,IR-007,"People who know {{topic}} rarely say this part out loud"
inside_room,IR-008,"The checklist I use before {{task}}"
inside_room,IR-009,"The rule that saves you from {{bad_outcome}}"
inside_room,IR-010,"The secret is not {{obvious_thing}}. It is {{real_thing}}"
direct_diagnosis,DD-001,"{{audience}}: stop doing {{bad_habit}} before it becomes {{bad_outcome}}"
direct_diagnosis,DD-002,"If {{goal}} feels impossible, this might be why"
direct_diagnosis,DD-003,"You are not bad at {{topic}}. Your setup is messy"
direct_diagnosis,DD-004,"If you keep doing {{bad_habit}}, {{bad_result}} will keep happening"
direct_diagnosis,DD-005,"This is why your {{thing}} looks like everyone else's"
direct_diagnosis,DD-006,"You are fixing {{symptom}} instead of {{real_problem}}"
direct_diagnosis,DD-007,"If you are {{audience}}, this habit is costing you {{cost}}"
direct_diagnosis,DD-008,"Your {{routine}} has one thing slowing it down"
direct_diagnosis,DD-009,"You are making {{task}} harder than it needs to be"
direct_diagnosis,DD-010,"Your effort is fine. It is going to the wrong part of {{task}}"
before_after_arc,BA-001,"From {{before_state}} to {{after_state}} in {{timeframe}}"
before_after_arc,BA-002,"The small change that took me from {{bad_result}} to {{better_result}}"
before_after_arc,BA-003,"How {{audience}} can go from {{pain_point}} to {{desired_outcome}}"
before_after_arc,BA-004,"I swapped {{old_way}} for {{new_way}}, and {{result}} changed"
before_after_arc,BA-005,"How to turn messy {{thing}} into clean {{thing}}"
before_after_arc,BA-006,"How {{one_change}} turned {{problem}} into {{advantage}}"
before_after_arc,BA-007,"Before I fixed {{problem}}, {{bad_result}} kept happening"
before_after_arc,BA-008,"The {{timeframe}} reset that changed my {{thing}}"
before_after_arc,BA-009,"I stopped {{old_habit}} and finally got {{result}}"
before_after_arc,BA-010,"How to turn {{input}} into {{output}} without overthinking it"
cost_alert,CA-001,"This common {{habit}} is quietly hurting your {{result}}"
cost_alert,CA-002,"Do not start {{task}} until you check {{thing}}"
cost_alert,CA-003,"The {{task}} mistake that wastes {{time}}"
cost_alert,CA-004,"If you ignore {{problem}}, it gets harder to fix"
cost_alert,CA-005,"Your {{tool}} might be causing the problem"
cost_alert,CA-006,"This is the red flag that {{problem}} is getting expensive"
cost_alert,CA-007,"One bad guess about {{topic}} can ruin {{result}}"
cost_alert,CA-008,"Check this before spending money on {{thing}}"
cost_alert,CA-009,"The risky part of {{trend}} people skip"
cost_alert,CA-010,"This tiny mistake turns into a bigger {{problem}}"
deadline_pull,DP-001,"Do this before {{milestone}} makes it harder"
deadline_pull,DP-002,"You are early to {{opportunity}}, but that will not last"
deadline_pull,DP-003,"The window for {{advantage}} is closing"
deadline_pull,DP-004,"Check this before you choose {{decision}}"
deadline_pull,DP-005,"If you are planning {{task}}, save this now"
deadline_pull,DP-006,"Fix {{problem}} before {{moment}}"
deadline_pull,DP-007,"Most {{audience}} learn this too late"
deadline_pull,DP-008,"You will want this before {{moment}}"
deadline_pull,DP-009,"Your reminder to handle {{task}} before {{deadline}}"
deadline_pull,DP-010,"Learn {{skill}} now and {{task}} gets easier later"
receipt_stack,RS-001,"I tried {{method}} on {{examples}}, and the answer was clear"
receipt_stack,RS-002,"Here is what changed when I only fixed {{one_thing}}"
receipt_stack,RS-003,"Things changed when I stopped doing {{old_habit}}"
receipt_stack,RS-004,"I compared {{option_a}} and {{option_b}} so you do not have to"
receipt_stack,RS-005,"This is what {{result}} looked like after {{timeframe}}"
receipt_stack,RS-006,"I tracked {{thing}} every day, and saw the same pattern"
receipt_stack,RS-007,"Here is what happened when I used {{method}} instead of {{old_way}}"
receipt_stack,RS-008,"I used {{tool}} for {{timeframe}} and checked {{result}}"
receipt_stack,RS-009,"The proof showed up after I tried {{action}}"
receipt_stack,RS-010,"This tiny test made {{outcome}} easier"
future_cast,FC-001,"{{thing}} is about to change how {{audience}} do {{task}}"
future_cast,FC-002,"Soon, {{old_way}} will feel old"
future_cast,FC-003,"The next wave of {{topic}} will reward {{skill}}"
future_cast,FC-004,"{{audience}} who ignore {{trend}} will feel behind"
future_cast,FC-005,"{{topic}} is moving from {{old_way}} to {{new_way}}"
future_cast,FC-006,"Here is where {{topic}} is probably going next"
future_cast,FC-007,"People using {{new_way}} now will move faster later"
future_cast,FC-008,"{{tool}} will not replace {{audience}}. It will replace {{old_way}}"
future_cast,FC-009,"The next big edge in {{topic}} is not {{obvious_thing}}"
future_cast,FC-010,"What happens when {{trend}} becomes normal"
test_drive,TD-001,"I tested {{thing}} and found the part people leave out"
test_drive,TD-002,"I tried {{method}} for {{timeframe}}, and kept only this"
test_drive,TD-003,"I compared {{number}} ways to do {{task}}. One was better"
test_drive,TD-004,"I used {{tool}} on {{project}}, and this part helped"
test_drive,TD-005,"I pushed {{thing}} until it broke"
test_drive,TD-006,"I followed {{method}} exactly, and this is what failed"
test_drive,TD-007,"I rebuilt {{thing}} from scratch to see if it worked"
test_drive,TD-008,"I gave {{thing}} one honest week"
test_drive,TD-009,"I tried the fast way and slow way to do {{task}}"
test_drive,TD-010,"I ran {{input}} through {{option_a}} and {{option_b}}"
pattern_break,PB-001,"The weird way {{method}} got {{result}}"
pattern_break,PB-002,"This tiny {{action}} saved more time than {{old_way}}"
pattern_break,PB-003,"I got {{surprising_result}} from something way too simple"
pattern_break,PB-004,"The ugly version of {{thing}} did better"
pattern_break,PB-005,"This should not have worked, but it beat {{popular_choice}}"
pattern_break,PB-006,"I removed {{thing}}, and {{result}} got better"
pattern_break,PB-007,"The lazy version of {{thing}} got the best response"
pattern_break,PB-008,"One boring change to {{thing}} made a big difference"
pattern_break,PB-009,"The thing I almost deleted saved {{project}}"
pattern_break,PB-010,"{{result}} sounds weird until you understand {{reason}}"
vulnerable_reveal,VR-001,"I almost gave up on {{thing}}, then noticed this"
vulnerable_reveal,VR-002,"I was embarrassed by {{mistake}}, but it taught me {{lesson}}"
vulnerable_reveal,VR-003,"I avoided {{task}} because I was scared of {{fear}}"
vulnerable_reveal,VR-004,"The hardest part of {{journey}} was not {{thing}}"
vulnerable_reveal,VR-005,"I pretended I understood {{topic}} until {{moment}} exposed me"
vulnerable_reveal,VR-006,"I lost {{cost}} because I ignored {{warning_sign}}"
vulnerable_reveal,VR-007,"I was wrong about {{belief}}, and it changed {{outcome}}"
vulnerable_reveal,VR-008,"The mistake I would delete from my first {{project}}"
vulnerable_reveal,VR-009,"I did not want to admit this about {{problem}}"
vulnerable_reveal,VR-010,"The moment I realized {{old_way}} was not working"
viewer_dare,VD-001,"Most {{audience}} cannot spot the mistake in this {{example}}"
viewer_dare,VD-002,"Try to find the problem in this {{example}} first"
viewer_dare,VD-003,"If you can answer this, you understand {{topic}}"
viewer_dare,VD-004,"Pause and guess which {{thing}} works better"
viewer_dare,VD-005,"Can you fix this {{task}} in under {{time_limit}}?"
viewer_dare,VD-006,"Only people who understand {{idea}} will catch this"
viewer_dare,VD-007,"Which would you choose: {{option_a}} or {{option_b}}?"
viewer_dare,VD-008,"I bet you will miss this detail in {{example}}"
viewer_dare,VD-009,"Rank these {{examples}} from worst to best"
viewer_dare,VD-010,"Before I explain, what would you change about {{thing}}?"
cold_open_story,CS-001,"{{time_marker}}, I was doing {{normal_task}} when {{unexpected_event}} happened"
cold_open_story,CS-002,"Someone asked for {{simple_request}}, then {{problem}} showed up"
cold_open_story,CS-003,"I opened {{thing}} and knew something was wrong"
cold_open_story,CS-004,"I thought {{task}} would be quick, then found {{surprise}}"
cold_open_story,CS-005,"A random {{message}} made me rethink {{topic}}"
cold_open_story,CS-006,"I was about to finish {{project}} when {{problem}} appeared"
cold_open_story,CS-007,"The first version of {{project}} was bad, but one detail saved it"
cold_open_story,CS-008,"I ignored {{small_warning}} until it became {{big_problem}}"
cold_open_story,CS-009,"The best idea came after I almost quit {{project}}"
cold_open_story,CS-010,"I showed {{thing}} to {{person}}, and their reaction changed everything"
```

## Hook Template Model

Runtime template records should support:

```ts
type HookTemplate = {
  id: string;
  styleKey: string;
  template: string;
  requiredVariables: string[];
  emotionalTrigger: string;
  bestFor: string[];
  riskLevel: "safe" | "medium" | "aggressive";
  active: boolean;
};
```

Implementation details:

- `requiredVariables` can be parsed from `{{placeholder}}` tokens.
- `emotionalTrigger`, `bestFor`, and `riskLevel` can default from style metadata
  unless a template-specific override is added later.
- The template picker should randomly choose from active templates in the
  product's eligible pool.
- The picker can filter out aggressive templates for product contexts where a
  direct or sensitive angle would be a bad fit.
- The random choice should happen server-side so the client does not ship the
  whole private resource library unnecessarily.

## Style Generation Rules

Store this in `resources/clipr/hook-style-rules.md`.

### Mystery Gap

Principle: hide one important piece of information so the viewer stays to
resolve it.

Formula: unknown detail + topic/problem + consequence.

Good variables: `topic`, `pain_point`, `root_problem`, `workflow`,
`hidden_factor`.

Avoid: being vague with no payoff.

### Authority Signal

Principle: make the hook feel informed, tested, or expert-backed.

Formula: credible source/method + pattern + practical implication.

Good variables: `expert`, `number`, `examples`, `principle`,
`professional_role`.

Avoid: fake studies, fake experts, made-up data.

### Anti-Advice

Principle: challenge common advice without becoming empty ragebait.

Formula: common belief + why it is wrong + better direction.

Good variables: `common_advice`, `old_way`, `better_solution`, `audience`,
`outcome`.

Avoid: disagreeing just to disagree.

### Inside Room

Principle: make the viewer feel they are getting access to hidden operating
knowledge.

Formula: insider group/system + unspoken rule + viewer benefit.

Good variables: `industry`, `experts`, `hidden_rule`, `incentive`,
`backstage_process`.

Avoid: unsupported conspiracy framing.

### Direct Diagnosis

Principle: speak directly to the viewer's mistake or blind spot.

Formula: audience/persona + bad behavior + cost.

Good variables: `audience`, `behavior`, `bottleneck`, `mistake`,
`negative_result`.

Avoid: sounding insulting unless the product tone supports it.

### Before/After Arc

Principle: show visible movement from a current bad state to a desired state.

Formula: before state + change + after state.

Good variables: `before_state`, `after_state`, `timeframe`, `old_way`,
`new_way`.

Avoid: promising unrealistic transformations.

### Cost Alert

Principle: make inaction feel expensive.

Formula: small mistake + hidden cost + future consequence.

Good variables: `behavior`, `cost`, `bad_outcome`, `warning_sign`,
`workflow`.

Avoid: fear without useful next steps.

### Deadline Pull

Principle: create urgency around timing.

Formula: before milestone + action + reason it matters now.

Good variables: `milestone`, `deadline`, `opportunity`, `future_situation`,
`trigger_event`.

Avoid: fake scarcity.

### Receipt Stack

Principle: use evidence, comparison, or measurement to make the claim feel real.

Formula: test/result + metric/proof + lesson.

Good variables: `number`, `metric`, `result`, `comparison`, `timeframe`.

Avoid: unverifiable numbers.

### Future Cast

Principle: help viewers prepare for a coming shift.

Formula: trend/change + who it affects + what to do now.

Good variables: `trend`, `timeframe`, `audience`, `old_model`, `new_model`.

Avoid: extreme predictions with no reasoning.

### Test Drive

Principle: let the creator take the risk or effort for the viewer.

Formula: I tried/tested/compared + thing + finding.

Good variables: `tool`, `method`, `test_subject`, `comparison`, `verdict`.

Avoid: pretending to test things you did not test.

### Pattern Break

Principle: open with something that violates expectation.

Formula: unexpected result + ordinary action + why it matters.

Good variables: `surprising_result`, `small_action`, `expected_winner`,
`principle`.

Avoid: shock claims that cannot be backed up.

### Vulnerable Reveal

Principle: start with honest tension or personal failure.

Formula: personal mistake/fear + moment + lesson.

Good variables: `mistake`, `fear`, `difficult_moment`, `lesson`,
`old_belief`.

Avoid: fake vulnerability.

### Viewer Dare

Principle: pull the viewer into the video by making them participate.

Formula: challenge + constraint + reveal/payoff.

Good variables: `task`, `example`, `time_limit`, `option_a`, `option_b`.

Avoid: challenges with no clear answer.

### Cold Open Story

Principle: drop the viewer into a specific moment before explaining context.

Formula: time/place/action + unexpected event + unresolved consequence.

Good variables: `time_marker`, `mundane_action`, `unexpected_event`, `project`,
`reaction`.

Avoid: long setup before the tension.

## Master Prompt For More Templates

Store this in `resources/clipr/hook-template-generation-prompt.md`.

```text
You are building a short-form video hook template library for ClipStitchr.
Generate 10 new reusable hook templates for this style:
Style name: {{style_name}}
Style principle: {{style_principle}}
Audience: {{target_audience}}
Product category: {{product_category}}
Tone: {{tone}}

Rules:
- Use fill-in-the-blank placeholders like {{audience}}, {{topic}}, {{pain_point}}, {{workflow}}, {{result}}, {{mistake}}, {{timeframe}}, {{tool}}, {{metric}}, {{before_state}}, {{after_state}}.
- Do not write finished hooks for one niche only.
- Do not use fake research, fake statistics, fake quotes, or fake expert claims.
- Keep each hook under 18 words when possible.
- Make each template reusable across SaaS, creator tools, mobile apps, agencies, and founder-led content.
- Avoid repeating the same sentence structure.
- Return as CSV with columns: style_key, template_id, template, required_variables, emotional_trigger, best_for, risk_level.
```

## Clipr Generation Flow

1. User opens `/dashboard/clipr`.
2. User selects a saved product profile from Settings.
3. User selects an avatar. The system resolves that avatar's most recent photo
   as the hidden reference image.
4. User chooses duration: `30 seconds` or `60 seconds`; default is `30 seconds`.
5. User selects a voice through a modal-style dropdown.
6. User can check `Make default` in the voice selector.
7. Server randomly selects a hidden hook style and 3-5 hidden templates from
   the product's eligible pool using product settings, inferred problem,
   inferred pain points, audience details, placeholder fillers, and safety
   rules.
8. GPT-4.1 fills hook placeholders and selects the strongest hook.
9. GPT-4.1 generates a Clipr script from the selected hook.
10. GPT-4.1 splits the script into short scene beats.
11. ElevenLabs v3 generates voice audio for each scene or script segment.
12. Scene generation runs one scene at a time:
    - avatar scenes first generate a scene-specific UGC-style still from the
      selected avatar reference photo, avatar description, script beat, and
      visual direction
    - the generated still is sent to P-Video as image-to-video input
    - b-roll scenes use P-Video text-to-video from product/audience context and
      a visual prompt
13. Generated avatar stills and generated scene videos are copied into R2.
14. If total scene duration is below the selected target, GPT-4.1 generates
    follow-up scene beats and the provider scene loop continues.
15. Media Bunny stitches all generated scene clips into one final 9:16 video.
16. If total scene duration is above the selected target, Media Bunny trims the
    stitched final output to the selected duration.
17. Clipr generates a poster image for the final output.
18. Final video and poster are uploaded to R2.
19. Convex saves the final output as a UGC-compatible video clip with Clipr
    provenance metadata.
20. The output appears in the Content Library `Clips` tab and can be used in
    Stitchr.

## AI Provider Notes

The exact provider schemas must be verified before implementation. Do not assume
model input keys from memory.

Planned model roles:

- Hook selection and script generation: `openai/gpt-4.1`.
- Text to speech: `elevenlabs/v3`.
- Avatar scene still generation: `openai/gpt-image-2`, using the selected
  avatar reference photo to create a UGC-style still that fits the scene.
- Scene video generation: `prunaai/p-video`, using image-to-video for avatar
  scenes and text-to-video for b-roll scenes.

Add environment overrides instead of hard-coding provider choices:

- `CLIPR_HOOK_MODEL_ID`
- `CLIPR_AVATAR_STILL_MODEL_ID`
- `CLIPR_TTS_MODEL_ID`
- `CLIPR_SCENE_MODEL_ID`

## Script Rules

Clipr scripts should:

- start from one generated hook
- stay in the selected duration target
- be split into multiple scene beats
- use a few lines per scene
- mix avatar scenes and b-roll scenes
- give the viewer a useful payoff
- avoid direct product selling by default
- avoid CTAs
- avoid fake stats, fake studies, fake quotes, and unverifiable claims
- avoid regulated claims unless the product profile explicitly and safely
  supports them

Clipr scripts should not:

- say "try our app"
- say "download"
- ask viewers to comment, follow, share, sign up, book, buy, or subscribe
- imply guaranteed outcomes
- invent user testimonials
- claim that an expert, study, institution, or dataset exists unless it was
  provided in the product settings

## Scene Model

Each generated scene should be represented as structured data:

```ts
type CliprScenePlan = {
  id: string;
  index: number;
  sceneType: "avatar" | "b_roll";
  scriptText: string;
  visualPrompt: string;
  photoScript?: string;
  estimatedDurationSeconds: number;
  voiceAudioObject?: R2ObjectReference;
  generatedVideoObject?: R2ObjectReference;
  providerPredictionId?: string;
};
```

The final job should preserve:

- selected product ID and product snapshot
- selected avatar ID, resolved avatar photo ID, and source image object
- selected voice ID
- selected duration target
- selected hidden hook style/template IDs
- filled hook
- variables used
- full script
- scene plan
- provider prediction IDs
- intermediate scene object references
- final clip ID after save

## Library And Data Model

The existing `clipType` should continue to describe the clip's stitching role:

- `ugc`
- `demo`

Clipr outputs should be saved as `clipType: "ugc"` for Stitchr compatibility,
with new Clipr provenance metadata. This avoids turning `clipType` into both a
role and an origin field.

Add metadata similar in spirit to `swaprMetadata`:

```ts
type CliprMetadata = {
  jobId: string;
  productId: string;
  productName: string;
  avatarId: string;
  avatarPhotoId: string;
  voiceId: string;
  targetDurationSeconds: 30 | 60;
  hookStyleKey: string;
  hookTemplateId: string;
  filledHook: string;
  variablesUsed: Record<string, string>;
  script: string;
  sceneCount: number;
  finalDurationSeconds: number;
  providerModels: string[];
  createdAt: string;
};
```

Content Library behavior:

- Add a `Clips` tab.
- `Clips` shows video clips with `cliprMetadata`.
- `UGC` should show uploaded/non-Clipr/non-Swapr UGC clips.
- `Swaps` should continue to show Swapr outputs.
- `All` should include UGC, Demo, Clips, Swaps, Swipes, and Stitches.
- Clipr clips should have `Use in Stitchr`, preview, metadata edit, download,
  and delete behavior consistent with other saved video clips.

## Routes And UI Touchpoints

Add:

- `/dashboard/clipr`
  - Clipr generation studio.
- `/dashboard/uploads?tab=clips`
  - Content Library Clips tab.

Update:

- Dashboard sidebar: add `Clipr`.
- Dashboard page: add Clipr entry point.
- Content Library tabs: add `Clips`.
- Stitchr UGC selector: include Clipr outputs as UGC-compatible.
- Upload/library filters: exclude Clipr outputs from plain UGC tab unless the
  All tab is selected.
- Video details dialog: show Clipr provenance in a user-friendly way without
  exposing hidden style/template IDs. Keep those IDs in internal metadata only.
- Settings product flow: ensure saved product context can be selected by Clipr,
  Swipr auto-text, and Stitchr auto-text.

## Swipr Auto-Generated Text

Swipr should use the shared hook/template engine to auto-generate slide text.

Rules:

- The user selects a saved product profile.
- Hidden hook style/template selection is random within the product's eligible
  pool.
- GPT-4.1 fills the hook and generates slide text.
- The first slide receives the hook.
- The remaining slides receive editable supporting points that answer or satisfy
  the hook.
- The user can revise before saving/downloading.
- The saved Swipe remains editable state, not rendered PNG files.
- The implementation should not expose the hidden style/template selection.

Suggested Swipr flow:

1. User selects product.
2. User chooses slide count.
3. User chooses or creates background.
4. User clicks an auto-text action.
5. Server selects hidden template(s), fills the hook, and generates supporting
   slide text.
6. Client applies the hook to the first slide and supporting text to the
   remaining slides.
7. User edits and saves.

## Stitchr Auto-Generated Text

Stitchr should use the shared hook/template engine to auto-generate the single
shared text overlay.

Rules:

- The user selects a saved product profile or the currently selected demo's
  product metadata can be used as context when available.
- Hidden hook style/template selection is random within the product's eligible
  pool.
- GPT-4.1 fills one short overlay hook.
- The generated overlay is editable.
- The existing one-overlay-per-batch rule remains unchanged.
- The same overlay applies to all selected UGC + Demo outputs in the batch.

## Landing Page And Copy Updates

Use the `brand-guidelines` skill:

- Product UI and documentation use Plain Speech.
- Marketing copy can have a little personality, but it must stay practical and
  low-hype.
- Do not use technical model names in landing page copy.
- Keep Stitchr as the main promise.
- Add Clipr as a way to create more reusable engagement clips when the library
  needs fresh material.

Landing page touchpoints:

- `web/app/_components/landing/LandingHero.tsx`
  - Keep the hero centered on turning UGC and demos into finished ads.
  - Optionally add a short mention that users can generate extra clips when the
    library is thin.
- `web/app/_components/landing/LandingStudioSection.tsx`
  - Add Clipr as a studio card.
- `web/app/_components/landing/LandingFeatureGrid.tsx`
  - Add a feature for generating reusable Clips.
  - Adjust existing AI clip copy so Swapr and Clipr are distinct.
- `web/app/_components/landing/LandingWorkflow.tsx`
  - Add a Clipr workflow.
- Any new UI copy:
  - buttons: `Generate Clip`, `Choose Voice`, `Make default`, `Use in Stitchr`
  - labels: `Duration`, `Voice`, `Avatar`, `Product`, `30 seconds`,
    `60 seconds`

## Backend And Rate Limits

Clipr adds paid-provider and storage surfaces. Rate limits must be implemented
before provider calls.

New enforcement surfaces to document and implement:

- Clipr hook/script generation.
- Clipr voice generation.
- Clipr scene-specific avatar still generation.
- Clipr avatar scene generation.
- Clipr b-roll scene generation.
- Clipr full job creation.
- Clipr job polling.
- Clipr job cancellation.
- Clipr provider output proxying, if any proxy route is added.
- R2 signed uploads/downloads for generated audio, scene videos, final videos,
  and posters.
- Convex job writes and final clip saves.

Required limits:

- per-user job create limits
- per-user generated seconds limits
- per-user voice generation limits
- per-user scene generation limits
- global provider spend limits
- polling limits
- R2 upload/download limits reused from existing routes
- Convex record-save/update limits reused or expanded

HTTP routes must return a clear `429` with retry timing when rate-limited.

Provider calls must never start before the matching rate limit is consumed.

## Durable Workflow Requirements

Clipr cannot be a page-local state machine only. It is a multi-provider workflow
and must be recoverable.

Add a durable job model such as `cliprJobs` rather than cramming all Clipr state
into the existing simple `replicateJobs` table.

The durable job should track:

- owner ID
- product/avatar/voice selections
- requested duration
- hook/template choices
- script
- scene plan
- provider stage
- provider prediction IDs or request IDs
- intermediate audio/video R2 objects
- final video/poster R2 objects
- final saved clip ID
- status
- progress
- error
- created/updated/completed/finalized timestamps

Provider outputs should be copied into R2 as soon as they are available.

Media Bunny final stitching can remain browser-based for MVP if the scene
outputs are already durable in R2 and the UI can resume final stitching from
those saved scene objects. The durable target should eventually move final
stitching to a worker if browser reliability becomes a problem.

## Implementation Touchpoints

Likely code changes after docs/resources are approved:

- `web/convex/schema.ts`
  - add `cliprJobs`
  - add `cliprMetadata` to `videoClips`
  - add product-level eligible hook style/template IDs and placeholder fillers
  - add voice preference storage or user preference table
- `web/convex/validators/*`
  - add Clipr metadata/job validators
  - add provider status validators if needed
- `web/convex/rateLimiter.ts`
  - add Clipr limit buckets
- `web/convex/rateLimits.ts`
  - add consume mutations for Clipr operations
- `web/convex/videoClips.ts`
  - accept and update Clipr metadata
- `web/lib/clipstitchr/types/*`
  - add Clipr metadata, job, scene, voice, and generation status types
- `web/lib/clipstitchr/server/*`
  - add Clipr prompt creation, response parsing, provider clients, and model ID
    helpers
  - update product enrichment prompt, parser, and tests for hook eligibility and
    placeholder fillers
- `web/app/api/clipr/*`
  - add job create/poll/cancel and any provider helper routes
- `web/lib/clipstitchr/media/*`
  - add or reuse Media Bunny scene-stitching helpers
- `web/app/dashboard/clipr/*`
  - add Clipr page client and controls
- `web/app/_components/clipr/*`
  - one component per file for product, avatar, duration, voice, progress,
    preview, and generated output controls
- `web/app/dashboard/uploads/UploadsPageClient.tsx`
  - add Clips tab/filter behavior
- `web/lib/clipstitchr/utils/*`
  - add Clipr filters and library-tab helpers
- `web/app/_components/dashboard/DashboardSidebar.tsx`
  - add Clipr nav link
- landing page components
  - update product copy with non-technical Clipr positioning

## Verification Plan

After implementation:

1. Run `npm run typecheck` from `web/`.
2. Run `npm run lint` from `web/`.
3. Run `npm test` from `web/`.
4. Test Clipr with a saved product, selected avatar, default 30s duration, and a
   selected voice.
5. Test `Make default` persists the selected voice.
6. Test 60s duration.
7. Test generated scene outputs save to R2 before final stitching.
8. Test a short job triggers follow-up scene generation if needed.
9. Test an over-target job trims to the selected duration.
10. Test final Media Bunny stitch creates a single 9:16 video.
11. Test final output appears in the `Clips` tab.
12. Test Clipr output is selectable in Stitchr.
13. Test UGC tab does not mix uploaded UGC with Clipr outputs.
14. Test All tab includes Clipr outputs.
15. Test Swipr auto-text puts the hook on the first slide and supporting text on
    the remaining slides.
16. Test Stitchr auto-text fills the single editable overlay.
17. Test paid-provider routes return `429` before provider calls when limited.
18. Review user-facing copy for non-technical language and no unwanted CTAs.

## Approval Decisions

These are the assumptions this scope makes:

- Clipr output should use product settings as context, but not pitch the product.
- Clipr output should have no platform, sales, or app CTA by default.
- Clipr style/template selection should be random within each product's eligible
  pool and hidden from users.
- Exact recreation should use saved job metadata, not a new random selection.
- Clipr outputs should save as UGC-compatible video clips with Clipr provenance
  instead of adding a third `clipType`.
- MVP final stitching can use Media Bunny from durable scene outputs, with a
  later worker path if reliability needs it.
- Exact provider model schemas will be verified immediately before
  implementation.

If any of these assumptions are wrong, revise this scope before implementation.
