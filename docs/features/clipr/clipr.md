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
standalone clips and must be saved into the Library and used in Stitchr the same
way UGC clips are used.

The implementation must also extend the hook system to Swipr slide text and
Stitchr text overlays so selected product settings can drive auto-generated
copy across generated UGC, Swipes, and Stitches. The first Swipr slide should use the
hook, and the remaining slides should pay it off with simple supporting points.

## Product Rules

- Product name: `Clipr`.
- Current visible modes: `Reaction`, `B-roll`, and `Demo`.
- Script mode exists behind `web/lib/clipstitchr/constants/isCliprScriptModeEnabled.ts`.
  Set that flag to `true` to show Script mode again in manual and automation UI.
- Non-demo Clipr outputs are UGC-compatible source clips with separate Clipr
  provenance. They appear in the Library `UGC` tab, count toward UGC,
  and remain selectable in Stitchr.
- Clipr Demo remixes are available in the manual Clipr mode picker, require one
  selected saved Demo clip, and save as Demo clips with Clipr provenance.
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
- Clipr does not expose a duration control.
- Generated scripts should be as long as needed to express the full idea without
  padding or forcing a fixed 30 or 60 second target.
- Clipr currently supports three visible generation choices: `Reaction`,
  `B-roll`, and `Demo`.
- Script mode keeps the existing talking-avatar script flow when the feature
  flag is enabled. While the flag is disabled, direct or saved Script requests
  resolve to Reaction or B-roll before provider work.
- Reaction and b-roll modes create one silent 4-10 second single-shot clip.
- Reaction mode uses internal source descriptions from
  `web/lib/clipstitchr/resources/clipr/reaction-source-prompts.json` to vary facial expressions,
  timing, and gesture references without exposing uploaded account media.
- B-roll mode creates one day-in-the-life action that fits the saved product
  context, such as exercise movement for a fitness product or job-site work for
  a service business.
- The user selects an avatar to use as the character reference. They should not
  have to select a specific image; the system should automatically use that
  avatar's first uploaded photo for stable, repeatable character consistency.
- Each avatar has a saved default voice for Script mode when Script mode is
  enabled.
- When Script mode is enabled, the Clipr voice selector should preload the
  selected avatar's saved voice and allow a one-off voice change without
  changing the avatar's saved voice.
- When Script mode is enabled, Clipr should generate one full-script avatar
  video from the selected avatar and voice.
- The generated Script avatar video should follow the full generated script length.
- Reaction and b-roll outputs do not use voice, speech, music generation, or
  PixVerse lip sync.
- Script mode can attach an existing, uploaded, or TikTok-imported sound when
  Script mode is enabled.
- Clipr sound uploads are stored in R2 separately from the video and kept
  private to the user's account.
- Clipr does not bake music into the saved library video. The user can remove
  music, choose another track, or change music volume later. Media Bunny mixes
  the saved clean video and selected music only when the user exports/downloads.
- Final non-demo Clipr outputs should be saved in the content library as UGC.
- Only Script Clipr clips can be marked posted or active from the library.
  Reaction, B-roll, Demo remixes, uploaded UGC, uploaded Demo, and Swapr assets
  do not show clip posted actions.

## Documentation Coverage

Clipr affects these docs:

- `docs/features/clipr/clipr.md`
  - Overwrite it with the full Clipr feature scope.
  - Include the hook/template engine, generation pipeline, voice selection,
    full-script avatar generation, library behavior, data model, rate limits,
    and MVP limits.
- `project-scope.md`
  - Add Clipr to feature requirements, routes, Library tabs, AI-assisted
    content supply, data model, phases, and success criteria.
  - Update old "no external services" language so it reflects the existing and
    planned paid-provider AI workflows.
- `docs/features/swipr/swipr.md`
  - Add auto-generated slide text from the shared hook-template engine.
  - Explain that selected product settings drive hidden template selection.
  - Keep rendered slide export behavior unchanged.
- `docs/features/stitchr/stitchr.md`
- `docs/features/platform/audience-first-generation.md`
  - Add optional auto-generated text overlays from the shared hook-template
    engine.
  - Explain that the generated overlay is editable per selected Stitchr output.
- `docs/product/strategy/positioning.md`
  - Add Clipr as a secondary source-creation workflow.
  - Keep Stitchr as the primary product promise.
  - Position Clipr as engagement content that feeds the library, not as an
    AI-first replacement for strategy or editing.
- `docs/product/guidance/copywriting.md`
  - Add Clipr feature copy, UI copy rules, and copy constraints.
  - Use clear, low-hype copy.
  - Avoid technical/provider language in user-facing copy.
- `docs/operations/security/rate-limits.md`
  - Add all Clipr paid-provider and backend surfaces.
  - Document per-user and global limits before provider calls.
  - Document output-seconds limits for 30s and 60s Clipr jobs.
  - Document which local Media Bunny work is not rate-limited and why.
- `docs/operations/reliability/durable-workflows.md`
  - Add Clipr as a multi-provider durable job workflow.
  - Require provider outputs to be copied to R2 before provider retention expires.
  - Require recoverable final Clip saving from saved avatar output.

## Internal Resource Files

Create a root `resources/` folder if it does not exist.

Create these non-user-facing files:

- `resources/clipr/hook-styles.csv`
  - Stores the 16 starter hook styles.
- `resources/clipr/hook-templates.csv`
  - Stores the starter hook templates plus purpose-specific expansions.
- `resources/clipr/hook-style-rules.md`
  - Stores style-by-style generation rules.
- `resources/clipr/hook-template-generation-prompt.md`
  - Stores the master prompt for generating more templates later.

Implementation can then expose typed runtime data through one-file-one-purpose
modules under `web/lib/clipstitchr/resources/clipr/` or
`web/lib/clipstitchr/constants/clipr/`, depending on the cleanest local pattern.

The resources must stay internal except for the saved product's preferred hook
style selector:

- UI may show friendly hook style names for product-level preference
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
identity_challenge,Identity Challenge,Provocation,Make a bold claim the viewer's identity or core belief won't let them scroll past
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

The identity challenge expansion also lives in the internal template resources
as `IC-001` through `IC-115` for Swipr and Stitchr reaction-first ad hooks.
The polarizing reaction pack lives beside it as `PR-001` through `PR-050` and
is Stitchr-only so UGC-then-demo overlays can favor sharper comparison,
callout, and identity-pressure hooks without changing Clipr behavior.

## Hook Template Model

Runtime template records should support:

```ts
type HookTemplate = {
  id: string;
  styleKey: string;
  template: string;
  requiredVariables: string[];
  allowedPurposes: Array<"clipr" | "swipr" | "stitchr">;
  source:
    | "clipstitchr"
    | "app_hook_library"
    | "education_viral_patterns"
    | "polarizing_reaction_patterns";
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
- A saved product may set `preferredCliprHookStyleKey`; when present, the
  picker should use active templates from that style before falling back to the
  inferred eligible pool.
- Purpose filtering happens before model prompting. Clipr must only receive
  non-promotional engagement templates, while Swipr and Stitchr may also receive
  direct product/ad hook templates.
- Clipr, Swipr, and Stitchr may use aggressive styles. Direct product/ad hook
  templates still depend on purpose-specific `allowedPurposes`.
- The random choice should happen server-side so the client does not ship the
  whole private resource library unnecessarily.

## Hook Asset Integration

The runtime hook engine now has four hidden template sources:

- `clipstitchr`: original non-promotional starter templates used by Clipr,
  Swipr, and Stitchr.
- `education_viral_patterns`: reusable education-style patterns distilled from
  `assets/hooks/46,606 VIRAL HOOKS - by socialgrowthengineers.com -
  Education.csv`. These are rewritten as placeholder templates rather than
  shown or copied as raw third-party examples.
- `app_hook_library`: product/ad hook templates generated from
  `assets/hooks/hook-library.json`. Bracket placeholders such as `[outcome]`
  are normalized to the app's `{{outcome}}` placeholder format, and direct
  phrases such as "this app" are normalized around `{{product_name}}`.
- `polarizing_reaction_patterns`: broad Stitchr-only templates for comparison,
  callout, identity challenge, unpopular-opinion, and dare-style overlays.

The UI must not expose the source names, template IDs, risk labels, or
placeholder mechanics. The app-promo library is available only to Swipr and
Stitchr auto-text because Clipr outputs must remain non-promotional engagement
clips. The polarizing reaction pack is available only to Stitchr auto-text.

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

### Identity Challenge

Principle: make a bold claim the viewer's core belief or identity won't let
them scroll past.

Formula: denial or challenge of core belief + audience signal.

Good variables: `core_belief`, `audience`, `popular_method`, `identity`,
`controversial_take`, `common_assumption`.

Avoid: claims that are discriminatory, medically dangerous, factually reckless,
or impossible to validate with a demo, result, or explanation in the content.

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
3. User selects an avatar. The system resolves that avatar's first uploaded
   photo as the hidden reference image.
4. User chooses `Reaction` or `B-roll`.
5. If `isCliprScriptModeEnabled` is `true`, Script mode is also visible. In
   Script mode, the user can paste a script idea for Clipr to expand.
6. If Script mode is visible, the voice selector preloads the avatar's saved
   voice and the user can select a different voice for this job only.
7. If Script mode is visible, the user can optionally enable generated
   background music. The control is unchecked by default.
8. Server randomly selects a hidden hook style and 3-5 hidden templates from
   the product's eligible pool using product settings, inferred problem,
   inferred pain points, audience details, placeholder fillers, and safety
   rules.
9. The shared Claude writing model fills hook placeholders and selects the
   strongest hook.
10. The shared Claude writing model generates a Clipr script from the selected
    hook.
11. The shared Claude writing model returns one avatar scene plan for the full
    script.
12. Clipr generates one UGC-style avatar still from the selected avatar
    reference photo, avatar description, full script, and visual direction.
13. The generated still, selected voice, and full script are sent to
    `prunaai/p-video-avatar` to create one talking avatar video.
14. If music is selected, Clipr keeps the sound metadata separate from
    the clean generated video.
15. The generated avatar still and full-script avatar video are copied into R2.
    Uploaded sound files are already stored as their own R2 objects.
16. The browser normalizes the full avatar video without baking in music.
17. Clipr generates a poster image for the final output.
18. Final video and poster are uploaded to R2.
19. Convex saves the final output as a UGC-compatible video clip with Clipr
    provenance metadata.
20. The output appears in the Library `UGC` tab and can be used in
    Stitchr.
21. If music metadata is attached and enabled, download/export renders a fresh
    MP4 with Media Bunny using the clean video, the R2 music file, and the saved
    music volume.

Reaction and b-roll modes share the same product/avatar/still-image start, then
skip hook/script prompting, voice, music, and lip sync:

1. The server creates one local visual plan instead of calling the shared
   writing model for a spoken script.
2. Reaction mode samples source descriptions from
   `web/lib/clipstitchr/resources/clipr/reaction-source-prompts.json` and chooses an emotion such
   as shock, sadness, disbelief, happiness, or confusion.
3. B-roll mode creates one product-relevant day-in-the-life prompt from the
   saved product and audience context.
4. The avatar still prompt is adjusted for the selected mode before image
   generation.
5. The resolved visual video model creates one 4-10 second vertical clip from
   the still and prompt. Kling v3 is the default for Reaction and B-roll unless
   `CLIPR_VISUAL_VIDEO_MODEL_ID` names another supported visual model.
6. The media worker strips audio during final normalization so visual-mode
   outputs stay silent even when a provider emits incidental audio.

Demo mode is a manual-only Seedance test path:

1. The user selects one saved Demo clip.
2. The server validates the Demo clip through Convex and passes its R2 video
   object to the provider worker.
3. The provider worker creates a local Demo plan instead of calling the shared
   writing model.
4. Seedance receives the selected Demo clip through `reference_videos` as
   `[Video1]` and is prompted to place the demo on a phone in someone's hand.
5. The media worker finalizes the silent 4-10 second output as a Demo library
   item with Clipr metadata.

## AI Provider Notes

The exact provider schemas must be verified before implementation. Do not assume
model input keys from memory.

Planned model roles:

- Hook selection and script generation: `anthropic/claude-sonnet-4.6` by
  default through `TEXT_WRITING_MODEL_ID`. `anthropic/claude-opus-4.6` is
  supported for higher-cost writing tests.
- Avatar still generation: use the same model, prompt builder, and input
  parameters as avatar photo generation, with one generated source still for the
  selected mode.
- Avatar video and voice generation: `prunaai/p-video-avatar`, using the
  generated still, selected voice, voice prompt, and full script. This is Script
  mode only.
- Visual video generation for Reaction and B-roll modes:
  `kwaivgi/kling-v3-video` by default, with `google/veo-3.1` available through
  `CLIPR_VISUAL_VIDEO_MODEL_ID`.
- Demo mode uses `bytedance/seedance-2.0` internally with `reference_videos` to
  test whether existing Demo clips can be remixed into phone-in-hand shots.
- Optional background music comes from an existing, uploaded, or TikTok-imported
  sound. Music generation is not available.
- PixVerse lip sync only runs for Script mode videos with speech audio. Silent
  Reaction, B-roll, and Demo outputs do not run PixVerse.

Add environment overrides instead of hard-coding provider choices:

- `TEXT_WRITING_MODEL_ID` for Clipr hook/script, Swipr auto-text, and Stitchr
  auto-text. `CLIPR_HOOK_MODEL_ID` remains a legacy fallback when the general
  writing variable is unset.
- `AVATAR_PHOTO_MODEL_ID` for avatar photo generation and Clipr avatar stills
- `CLIPR_AVATAR_VIDEO_MODEL_ID`
- `CLIPR_VISUAL_VIDEO_MODEL_ID`

## Script Rules

Clipr scripts should:

- start from one generated hook
- be as long as needed to fully explain the idea
- be written as one natural spoken avatar monologue
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

## Avatar Scene Model

The generated full-script avatar plan should be represented as structured data:

```ts
type CliprScenePlan = {
  id: string;
  index: number;
  sceneType: "avatar";
  scriptText: string;
  visualPrompt: string;
  photoScript?: string;
  estimatedDurationSeconds: number;
  voiceAudioObject?: R2ObjectReference;
  providerPredictionId?: string;
};
```

The final job should preserve:

- selected product ID and product snapshot
- selected avatar ID, resolved avatar photo ID, and source image object
- selected voice ID
- generated script and scene duration estimate
- selected hidden hook style/template IDs
- filled hook
- variables used
- full script
- single avatar scene plan
- provider prediction IDs
- intermediate avatar image and avatar video object references
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
  requestedGenerationMode?: "any" | "script" | "reaction" | "broll";
  generationMode?: "script" | "reaction" | "broll";
  requestedVideoModelId?: string;
  videoModelId?: string;
  targetDurationSeconds: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 30 | 60;
  hookStyleKey: string;
  hookTemplateId: string;
  filledHook: string;
  variablesUsed: Record<string, string>;
  script: string;
  sceneCount: number;
  finalDurationSeconds: number;
  music?: CliprMusicMetadata;
  providerModels: string[];
  createdAt: string;
};

type CliprMusicMetadata = {
  audioObject: R2ObjectReference;
  prompt: string;
  providerModel: string;
  providerPredictionId: string;
  durationSeconds: number; // always 60 for the current provider config
  enabled: boolean;
  volume: number; // 0-1 multiplier over the app's ad/music mix ratio
  createdAt: string;
  updatedAt: string;
};
```

Library behavior:

- There is no visible `Clips` tab.
- `UGC` should show uploaded UGC plus non-demo Clipr outputs with
  `cliprMetadata`.
- Legacy records with `libraryKind: "clipr"` should be folded into visible UGC
  lists and counts for compatibility.
- `Demo` should show uploaded demos plus Clipr Demo remixes.
- `Swaps` should continue to show Swapr outputs.
- Clipr videos should have `Use in Stitchr`, preview, metadata edit, music
  settings, download/export, and delete behavior consistent with other saved
  video clips.
- Script Clipr clips may also be marked posted or active. Reaction, B-roll, and
  Demo remix clips do not show posted actions even though they remain usable in
  the library.
- Music settings should let the user disable/remove music, choose uploaded or
  imported sounds, and
  change the export volume. These changes update metadata and the R2 music
  object, not the saved clean video.

## Routes And UI Touchpoints

Add:

- `/dashboard/clipr`
  - Clipr generation studio.
  - Mode picker for `Reaction` and `B-roll`.
  - Script mode appears only when `isCliprScriptModeEnabled` is `true`.
- `POST /api/music/upload`
  - Authenticated, rate-limited private sound upload endpoint used by Clipr,
    Stitchr, and the sound picker.
- `POST /api/music/tiktok/search`
  - Authenticated, rate-limited TikTok sound search endpoint used by the sound
    picker.
- `POST /api/music/tiktok/import`
  - Authenticated, rate-limited TikTok sound import endpoint used by the sound
    picker.
- `/dashboard/library?tab=ugc`
  - Generated non-demo Clipr output appears with UGC.

Update:

- Dashboard sidebar: add `Clipr`.
- Dashboard page: add Clipr entry point.
- Library tabs: remove the old visible `Clips` tab.
- Stitchr UGC selector: include Clipr outputs as UGC-compatible.
- Upload/library filters: include Clipr outputs in UGC.
- Video details dialog: show Clipr provenance in a user-friendly way without
  exposing hidden style/template IDs. Keep those IDs in internal metadata only.
- Settings product flow: ensure saved product context can be selected by Clipr,
  Swipr auto-text, and Stitchr auto-text.
- Settings automation panel: allow automatic Clipr jobs to use `Any`,
  `Reaction`, or `B-roll`. Script appears only when
  `isCliprScriptModeEnabled` is `true`. While Script is hidden, `Any` resolves
  to Reaction or B-roll before provider work.

## Swipr Auto-Generated Text

Swipr should use the shared hook/template engine to auto-generate slide text.

Rules:

- The user selects a saved product profile.
- Hidden hook style/template selection is random within the product's eligible
  pool and may include app-promo hook-library templates.
- The shared Claude writing model fills the hook and generates slide text.
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

Stitchr should use the shared hook/template engine to auto-generate a single
text overlay for the active selected output.

Rules:

- The user selects a saved product profile or the currently selected demo's
  product metadata can be used as context when available.
- Hidden hook style/template selection is random within the product's eligible
  pool and may include app-promo hook-library templates.
- The shared Claude writing model fills one short overlay hook.
- The generated overlay is editable.
- The existing one-overlay-per-stitch rule remains unchanged.
- The active overlay can be copied to all selected UGC + Demo outputs in the batch.

## Landing Page And Copy Updates

Use the `brand-guidelines` skill:

- Product UI and documentation use Plain Speech.
- Marketing copy can have a little personality, but it must stay practical and
  low-hype.
- Do not use technical model names in landing page copy.
- Keep one-click Stitchr batch creation as the main promise.
- Position Clipr as a source-material helper for users who do not have enough
  clips for the next batch.

Landing page touchpoints:

- `web/app/_components/landing/LandingHero.tsx`
  - Keep the hero centered on making more ad variants from saved clips.
  - Do not mention Clipr in the hero unless the core batch promise is already
    clear.
- `web/app/_components/landing/LandingStudioSection.tsx`
  - Present Clipr with Swapr and avatar photos under the "Need more clips?"
    objection.
- `web/app/_components/landing/LandingOfferStackSection.tsx`
  - Include Clipr inside the offer stack as extra UGC generation.
- `web/app/_components/landing/LandingWorkflow.tsx`
  - Keep the workflow focused on upload clips, pick the product demo, and create
    the batch.
- Any new UI copy:
  - buttons: `Generate UGC`, `Use in Stitchr`
  - labels: `Avatar`, `Product`, `Reaction`, `B-roll`

## Backend And Rate Limits

Clipr adds paid-provider and storage surfaces. Rate limits must be implemented
before provider calls.

New enforcement surfaces to document and implement:

- Clipr hook/script generation.
- Swipr and Stitchr auto-text through the same Clipr hook/script generation
  route. The expanded local template libraries do not add a new backend surface.
- Clipr full-script avatar video and voice generation.
- Clipr silent visual video generation for Reaction and B-roll.
- Private sound upload, TikTok import, and selection.
- Clipr avatar still generation.
- Clipr full job creation.
- Clipr job polling.
- Clipr job cancellation.
- Clipr provider output proxying, if any proxy route is added.
- R2 signed uploads/downloads for generated avatar videos, final videos, and
  posters.
- Convex job writes and final clip saves.

Required limits:

- per-user job create limits
- per-user generated seconds limits
- per-user voice generation limits
- per-user avatar video generation limits
- per-user silent visual video generation limits
- private sound upload byte limits
- TikTok sound lookup and import limits
- global provider spend limits
- polling limits
- R2 upload/download limits reused from existing routes
- Convex record-save/update limits reused or expanded

HTTP routes must return a clear `429` with retry timing when rate-limited.

Provider calls must never start before the matching rate limit is consumed.

## Durable Workflow Requirements

Clipr cannot be a page-local state machine only. It is a multi-provider workflow
and must be recoverable.

The current implementation uses `cliprJobs` for user-facing job state and
`providerJobs` or automation tasks for durable provider execution. `POST
/api/clipr/jobs` handles request parsing, quota consumption, Convex input
loading, queued job persistence, provider job creation, analytics, and failure
cleanup. The provider worker owns text planning, avatar still generation for
non-Demo modes, video generation, and media-job creation. The media worker
normalizes the final video, strips audio for silent visual modes, attaches any
selected sound, creates the poster, and saves the final library Clip or Demo.

The durable job should track:

- owner ID
- product/avatar/voice selections
- requested generation mode, resolved generation mode, requested model, and
  resolved video model
- generated script and scene duration estimate
- hook/template choices
- script
- scene plan
- provider stage
- provider prediction IDs or request IDs
- intermediate avatar image/video R2 objects
- optional music R2 object, provider prediction ID, prompt, enabled flag, and
  export volume
- final video/poster R2 objects
- final saved clip ID
- status
- progress
- error
- created/updated/completed/finalized timestamps

Provider outputs should be copied into R2 as soon as they are available.

For the simplified MVP path, the browser only downloads the generated avatar
video, normalizes it to the app's 9:16 clip format, creates a poster, uploads
the final objects, and saves the Clip metadata. Optional selected or uploaded
music remains a separate editable asset. If chunked avatar generation is added later for provider duration caps,
those chunk outputs should be copied to R2 before any Media Bunny merge step
starts.

## Implementation Touchpoints

Current and future code areas:

- `web/convex/schema.ts`
  - `cliprJobs` stores user-facing job state.
  - `videoClips` stores Clipr provenance and optional export-time music settings.
  - Products and avatars store hook/style context and saved voice preferences.
- `web/convex/validators/*`
  - Clipr metadata/job validators and provider status validators.
- `web/convex/rateLimiter.ts`
  - Clipr limit buckets.
- `web/convex/rateLimits.ts`
  - consume mutations for Clipr operations.
- `web/convex/videoClips.ts`
  - accepts and updates Clipr metadata.
- `web/lib/clipstitchr/types/*`
  - Clipr metadata, job, scene, voice, mode, model, and generation status types.
- `web/lib/clipstitchr/server/clipr/*`
  - request parsing, start quotas, Convex input loading, queued job persistence,
    script planning, avatar still generation, avatar video generation, selected
    music metadata, analytics, and failure cleanup.
- `web/lib/clipstitchr/server/*`
  - shared prompt creation, response parsing, provider clients, model ID helpers,
    visual Clipr prompt builders, product enrichment, and rate-limit helpers.
- `web/lib/clipstitchr/resources/clipr/reaction-source-prompts.json`
  - sanitized source descriptions sampled for Reaction-mode visual prompts.
- `web/app/api/clipr/*`
  - job create, text, music, cancellation, and any future provider helper routes.
- `web/lib/clipstitchr/media/*`
  - reuse upload normalization and poster helpers for the generated avatar video.
  - export-time Clipr music mixing from clean video and separate R2 audio.
- `web/services/provider-worker/runProviderWorker.ts`
  - durable manual and automatic Clipr provider execution.
- `web/services/media-worker/runMediaWorker.mjs`
  - Clipr finalization, 9:16 normalization, poster capture, and visual-mode
    audio stripping.
- `web/app/dashboard/clipr/*`
  - Clipr page client and controls.
- `web/app/_components/clipr/*`
  - one component per file for product, avatar, mode, model, voice, progress,
    preview, and generated output controls.
- `web/app/dashboard/library/LibraryPageClient.tsx`
  - UGC tab/filter behavior for uploaded and generated UGC.
- `web/lib/clipstitchr/utils/*`
  - Clipr filters and library-tab helpers.
- `web/app/_components/dashboard/DashboardSidebar.tsx`
  - Clipr nav link.
- landing page components
  - product copy with non-technical Clipr positioning.

## Verification Plan

After implementation:

1. Run `npm run typecheck` from `web/`.
2. Run `npm run lint` from `web/`.
3. Run `npm test` from `web/`.
4. Test Clipr with a saved product, selected avatar, Reaction mode, and B-roll
   mode.
5. Test changing an avatar's saved voice updates the preloaded Clipr voice when
   that avatar is selected when Script mode is enabled.
6. If `isCliprScriptModeEnabled` is `true`, test Script mode with a pasted
   script idea.
7. Test generated avatar image and avatar video outputs save to R2 before final
   Clip save.
8. Test the full generated script is passed to `prunaai/p-video-avatar`.
9. Test selected music creates a 60 second Stable Audio file in R2 while avatar
   video generation is running.
10. Test the generated avatar video normalizes to a single clean 9:16 Clip
    without baked-in music.
11. Test Clipr music can be disabled, removed, regenerated, and volume-adjusted
    after the Clip is saved.
12. Test download/export renders a new MP4 with the selected music mix and
    leaves the saved clean video unchanged.
13. Test progress updates through script, image, avatar video, normalization,
    poster, and save steps.
14. Test final output appears in the `UGC` tab.
15. Test Clipr output is selectable in Stitchr.
16. Test UGC tab includes uploaded UGC and generated Clipr UGC together.
17. Test Swipr auto-text puts the hook on the first slide and supporting text on
    the remaining slides.
18. Test Stitchr auto-text fills the single editable overlay.
19. Test paid-provider routes return `429` before provider calls when limited.
21. Test Reaction mode creates a 4-10 second silent single-shot Clip and does
    not call hook/script, voice, music, or PixVerse lip sync.
22. Test B-roll mode creates a 4-10 second silent single-shot Clip with a
    product-relevant day-in-the-life prompt.
23. Test Settings automation mode selection defaults to Any and queues Reaction
    or B-roll jobs with the correct target duration. If Script mode is enabled,
    test Script jobs too.
24. Review user-facing copy for non-technical language and no unwanted CTAs.

## Approval Decisions

These are the assumptions this scope makes:

- Clipr output should use product settings as context, but not pitch the product.
- Clipr output should have no platform, sales, or app CTA by default.
- Clipr style/template selection should be random within each product's eligible
  pool and hidden from users.
- Exact recreation should use saved job metadata, not a new random selection.
- Script, Reaction, and B-roll outputs should save as UGC-compatible video clips
  with Clipr provenance. Demo remixes should save as Demo clips with Clipr
  provenance.
- The simplified MVP saves one full-script avatar video directly as the final
  clean Clipr Clip. Optional music remains a separate R2-backed asset and is
  mixed only during export/download. If provider output is capped below the
  requested script length, chunked avatar generation and a durable merge step
  should be added next.
- Reaction and b-roll outputs are silent single-shot visual clips, so the media
  worker strips provider audio during finalization and no PixVerse lip-sync step
  is scheduled.
- Exact provider model schemas will be verified immediately before
  implementation.

If any of these assumptions are wrong, revise this scope before implementation.
