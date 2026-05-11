import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import { getCliprTemplateVariables } from "@/lib/clipstitchr/utils/getCliprTemplateVariables";

type RawCliprHookTemplate = {
  styleKey: string;
  templateId: string;
  template: string;
};

const styleDefaults: Record<
  string,
  Pick<CliprHookTemplate, "emotionalTrigger" | "bestFor" | "riskLevel">
> = {
  mystery_gap: {
    emotionalTrigger: "curiosity",
    bestFor: ["educational content", "problem awareness", "open loops"],
    riskLevel: "safe",
  },
  authority_signal: {
    emotionalTrigger: "credibility",
    bestFor: ["expert content", "frameworks", "market education"],
    riskLevel: "safe",
  },
  anti_advice: {
    emotionalTrigger: "contradiction",
    bestFor: ["hot takes", "mistake correction", "founder-led content"],
    riskLevel: "medium",
  },
  inside_room: {
    emotionalTrigger: "insider access",
    bestFor: ["behind-the-scenes content", "industry education", "tips"],
    riskLevel: "safe",
  },
  direct_diagnosis: {
    emotionalTrigger: "self-recognition",
    bestFor: ["pain-point content", "mistake correction", "quick tips"],
    riskLevel: "medium",
  },
  before_after_arc: {
    emotionalTrigger: "transformation",
    bestFor: ["how-to content", "case study framing", "process content"],
    riskLevel: "safe",
  },
  cost_alert: {
    emotionalTrigger: "loss avoidance",
    bestFor: ["warning content", "problem awareness", "risk education"],
    riskLevel: "medium",
  },
  deadline_pull: {
    emotionalTrigger: "urgency",
    bestFor: ["trend content", "planning content", "timely advice"],
    riskLevel: "medium",
  },
  receipt_stack: {
    emotionalTrigger: "proof",
    bestFor: ["tests", "comparisons", "results breakdowns"],
    riskLevel: "safe",
  },
  future_cast: {
    emotionalTrigger: "anticipation",
    bestFor: ["trend content", "strategic advice", "market shifts"],
    riskLevel: "safe",
  },
  test_drive: {
    emotionalTrigger: "experiment",
    bestFor: ["review content", "comparisons", "tool tests"],
    riskLevel: "safe",
  },
  pattern_break: {
    emotionalTrigger: "surprise",
    bestFor: ["pattern interrupts", "counterintuitive lessons", "retention hooks"],
    riskLevel: "medium",
  },
  vulnerable_reveal: {
    emotionalTrigger: "honesty",
    bestFor: ["founder-led content", "lessons learned", "story content"],
    riskLevel: "medium",
  },
  viewer_dare: {
    emotionalTrigger: "participation",
    bestFor: ["challenge content", "comment-friendly prompts", "self-tests"],
    riskLevel: "safe",
  },
  cold_open_story: {
    emotionalTrigger: "narrative tension",
    bestFor: ["storytime", "founder-led content", "lessons learned"],
    riskLevel: "safe",
  },
};

const rawCliprHookTemplates: RawCliprHookTemplate[] = [
  {
    styleKey: "mystery_gap",
    templateId: "MG-001",
    template: "The part of {{topic}} nobody notices until {{pain_point}}",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-002",
    template: "I found the hidden reason {{audience}} keep failing at {{goal}}",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-003",
    template: "There is one tiny detail in {{process}} that changes everything",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-004",
    template: "Most people miss this step before they try {{action}}",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-005",
    template:
      "This looks like a {{surface_problem}}, but it is really a {{root_problem}}",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-006",
    template: "The weirdest thing happened when I changed {{one_variable}}",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-007",
    template:
      "Nobody talks about the first sign that {{bad_outcome}} is coming",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-008",
    template: "I wish I knew this before spending {{cost}} on {{thing}}",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-009",
    template:
      "The real reason {{common_problem}} keeps happening is not what you think",
  },
  {
    styleKey: "mystery_gap",
    templateId: "MG-010",
    template:
      "Watch what happens when you remove {{unnecessary_step}} from {{workflow}}",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-001",
    template:
      "After studying {{number}} examples of {{topic}}, this pattern kept showing up",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-002",
    template:
      "A {{role_or_expert}} would never start {{task}} without checking this first",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-003",
    template:
      "The best {{professionals}} use this rule before making {{decision}}",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-004",
    template:
      "Here is the framework {{experienced_group}} use to avoid {{mistake}}",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-005",
    template: "If you understand {{principle}}, {{topic}} gets way easier",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-006",
    template: "This is the difference between beginner and expert {{audience}}",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-007",
    template:
      "I analyzed {{number}} {{examples}} and found the same mistake in almost all of them",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-008",
    template: "The smartest {{audience}} do this before they ever {{action}}",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-009",
    template: "Here is the professional way to think about {{problem}}",
  },
  {
    styleKey: "authority_signal",
    templateId: "AS-010",
    template: "Most advice on {{topic}} ignores this basic rule",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-001",
    template: "The popular advice about {{topic}} is making {{audience}} worse",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-002",
    template:
      "You do not need more {{common_solution}} - you need {{better_solution}}",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-003",
    template: "Everyone says to {{common_advice}}, but that is backwards",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-004",
    template:
      "The fastest way to improve {{outcome}} is to stop chasing {{vanity_metric}}",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-005",
    template: "{{audience}} are solving the wrong version of {{problem}}",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-006",
    template:
      "The thing you think is helping {{goal}} is probably slowing it down",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-007",
    template: "Stop optimizing {{small_detail}} before fixing {{core_issue}}",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-008",
    template: "The lazy-looking way to do {{task}} is often the better way",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-009",
    template: "Most {{audience}} should ignore this trendy {{tool_or_tactic}}",
  },
  {
    styleKey: "anti_advice",
    templateId: "AA-010",
    template:
      "The best move is not doing more - it is removing {{friction_point}}",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-001",
    template: "The quiet rule {{experts}} follow when they work on {{topic}}",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-002",
    template: "Here is what happens behind the scenes before {{result}}",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-003",
    template: "The part of {{industry}} beginners almost never get told",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-004",
    template: "The hidden incentive that explains why {{system}} works this way",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-005",
    template: "What actually happens after you {{action}}",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-006",
    template:
      "The backstage reason {{common_experience}} feels so confusing",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-007",
    template:
      "People inside {{industry}} know this, but rarely say it publicly",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-008",
    template: "This is the private checklist I use before {{task}}",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-009",
    template:
      "The unspoken rule of {{topic}} that saves you from {{bad_outcome}}",
  },
  {
    styleKey: "inside_room",
    templateId: "IR-010",
    template: "The secret is not {{obvious_factor}} - it is {{hidden_factor}}",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-001",
    template: "{{audience}}: quit {{behavior}} before it turns into {{bad_outcome}}",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-002",
    template:
      "If {{goal}} feels impossible, you are probably making this mistake",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-003",
    template: "You are not bad at {{topic}} - your system is broken",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-004",
    template:
      "If you keep {{behavior}}, do not be surprised when {{negative_result}} happens",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-005",
    template: "This is why your {{output}} still looks like everyone else's",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-006",
    template: "You are trying to fix {{symptom}} instead of {{root_problem}}",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-007",
    template: "If you are a {{persona}}, this habit is costing you {{cost}}",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-008",
    template: "Your {{workflow}} has one bottleneck, and it is probably this",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-009",
    template: "You are making {{task}} harder than it needs to be",
  },
  {
    styleKey: "direct_diagnosis",
    templateId: "DD-010",
    template: "The problem is not your effort - it is where the effort is going",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-001",
    template: "From {{before_state}} to {{after_state}}: the {{timeframe}} breakdown",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-002",
    template:
      "The simple change that took me from {{bad_result}} to {{better_result}}",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-003",
    template:
      "Here is how {{audience}} can go from {{pain_point}} to {{desired_outcome}}",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-004",
    template: "I replaced {{old_way}} with {{new_way}}, and {{result}} changed fast",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-005",
    template: "This is the path from messy {{thing}} to clean {{thing}}",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-006",
    template: "How {{one_change}} turned {{problem}} into {{advantage}}",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-007",
    template: "Before I fixed {{root_problem}}, {{bad_outcome}} kept happening",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-008",
    template:
      "The {{timeframe}} reset that changed my {{area_of_life_or_business}}",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-009",
    template: "I stopped doing {{old_behavior}} and finally got {{outcome}}",
  },
  {
    styleKey: "before_after_arc",
    templateId: "BA-010",
    template: "The step-by-step way to turn {{input}} into {{output}}",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-001",
    template: "This common {{behavior}} is quietly hurting your {{outcome}}",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-002",
    template: "Do not start {{task}} until you check this",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-003",
    template: "The mistake in {{workflow}} that wastes {{cost_or_time}}",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-004",
    template: "If you ignore this, {{bad_outcome}} gets harder to fix",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-005",
    template:
      "Your {{tool_or_process}} may be creating the exact problem you are trying to solve",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-006",
    template: "This is the red flag that {{problem}} is about to get expensive",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-007",
    template: "One wrong assumption about {{topic}} can ruin {{result}}",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-008",
    template: "Avoid this before you spend money on {{thing}}",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-009",
    template: "The dangerous part of {{trend}} nobody explains upfront",
  },
  {
    styleKey: "cost_alert",
    templateId: "CA-010",
    template: "This small mistake compounds into {{large_problem}}",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-001",
    template: "Do this before {{milestone}} or you will make it harder later",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-002",
    template: "You are early to {{opportunity}}, but not for long",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-003",
    template:
      "The window for {{advantage}} is closing faster than people think",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-004",
    template: "Before you commit to {{decision}}, check this first",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-005",
    template: "If you are planning {{event_or_task}}, save this now",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-006",
    template: "The best time to fix {{problem}} is before {{trigger_event}}",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-007",
    template: "Most {{audience}} realize this too late",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-008",
    template: "You will wish you knew this before {{future_situation}}",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-009",
    template: "This is your reminder to handle {{task}} before {{deadline}}",
  },
  {
    styleKey: "deadline_pull",
    templateId: "DP-010",
    template:
      "The people who learn {{skill}} now will have an unfair advantage later",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-001",
    template:
      "I tested {{method}} on {{number}} examples, and the result was clear",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-002",
    template: "Here is the before-and-after from changing only {{one_variable}}",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-003",
    template: "The numbers changed when I stopped doing {{old_behavior}}",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-004",
    template:
      "I compared {{option_a}} versus {{option_b}} so you can see the difference",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-005",
    template: "This is what {{result}} looked like after {{timeframe}}",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-006",
    template: "I tracked {{metric}} every day, and this was the pattern",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-007",
    template: "Here are the receipts from using {{method}} instead of {{old_way}}",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-008",
    template: "I used {{tool_or_process}} for {{timeframe}} and measured {{metric}}",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-009",
    template: "The proof is in what happened after {{action}}",
  },
  {
    styleKey: "receipt_stack",
    templateId: "RS-010",
    template: "This tiny test revealed the fastest way to improve {{outcome}}",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-001",
    template: "{{thing}} is about to change how {{audience}} handle {{task}}",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-002",
    template: "In the next {{timeframe}}, {{old_way}} will feel outdated",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-003",
    template:
      "The next wave of {{industry}} will reward people who understand {{skill}}",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-004",
    template: "{{audience}} who ignore {{trend}} will feel behind soon",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-005",
    template:
      "The future of {{topic}} looks less like {{old_model}} and more like {{new_model}}",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-006",
    template: "This is what {{topic}} will probably look like after {{change}}",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-007",
    template: "The people using {{new_approach}} now will move faster later",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-008",
    template:
      "{{tool_or_trend}} will not replace {{audience}} - it will replace {{old_workflow}}",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-009",
    template: "The next big advantage in {{field}} is not {{obvious_thing}}",
  },
  {
    styleKey: "future_cast",
    templateId: "FC-010",
    template:
      "Here is what I think happens after {{current_trend}} becomes normal",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-001",
    template: "I tested {{thing}} and found the part everyone leaves out",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-002",
    template: "I tried {{method}} for {{timeframe}} and would only keep this part",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-003",
    template: "I compared {{number}} ways to do {{task}} - one was clearly better",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-004",
    template: "I used {{tool}} on a real {{project}}, and here is where it helped",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-005",
    template: "I stress-tested {{workflow}} until it broke",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-006",
    template: "I followed the popular {{method}} exactly, and this is what failed",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-007",
    template: "I rebuilt {{thing}} using {{approach}} to see if it actually works",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-008",
    template: "I gave {{tool_or_method}} one honest week - here is the verdict",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-009",
    template: "I tried the fast version of {{task}}, then the careful version",
  },
  {
    styleKey: "test_drive",
    templateId: "TD-010",
    template: "I ran the same {{input}} through {{option_a}} and {{option_b}}",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-001",
    template: "The weird way {{method}} created {{result}}",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-002",
    template: "This {{small_action}} saved more time than my entire {{old_system}}",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-003",
    template: "I got {{surprising_result}} from something that looked too simple",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-004",
    template:
      "The ugliest version of {{thing}} performed better than the polished one",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-005",
    template: "This should not have worked, but it beat {{expected_winner}}",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-006",
    template: "I removed {{important_sounding_thing}}, and {{result}} improved",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-007",
    template: "The lowest-effort version got the best response",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-008",
    template: "One boring change created a surprisingly big result",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-009",
    template: "The thing I almost deleted became the best part of {{project}}",
  },
  {
    styleKey: "pattern_break",
    templateId: "PB-010",
    template: "This result makes no sense until you understand {{principle}}",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-001",
    template:
      "I nearly {{dramatic_action}} after {{difficult_moment}}, then noticed this",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-002",
    template: "I was embarrassed by {{mistake}}, but it taught me {{lesson}}",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-003",
    template: "I avoided {{task}} for months because I was scared of {{fear}}",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-004",
    template: "The hardest part of {{journey}} was not what I expected",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-005",
    template: "I used to pretend I understood {{topic}} until this exposed me",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-006",
    template: "I lost {{cost}} because I ignored this obvious warning",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-007",
    template: "I was wrong about {{belief}}, and fixing it changed {{outcome}}",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-008",
    template: "This is the mistake I would delete from my first {{project}}",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-009",
    template: "I did not want to admit this about {{problem}}",
  },
  {
    styleKey: "vulnerable_reveal",
    templateId: "VR-010",
    template: "The moment I realized {{old_way}} was not working",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-001",
    template: "Most {{audience}} cannot spot the mistake in this {{example}}",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-002",
    template: "Try to find the problem before I reveal it",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-003",
    template:
      "If you can answer this, you understand {{topic}} better than most people",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-004",
    template: "Pause here and guess which version performs better",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-005",
    template: "Can you fix this {{workflow}} in under {{time_limit}}?",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-006",
    template:
      "Only people who understand {{principle}} will notice what is wrong here",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-007",
    template: "Which one would you choose: {{option_a}} or {{option_b}}?",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-008",
    template: "I bet you will miss the most important detail in this clip",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-009",
    template: "Rank these {{examples}} from worst to best",
  },
  {
    styleKey: "viewer_dare",
    templateId: "VD-010",
    template: "Before I explain, tell me what you would change first",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-001",
    template:
      "{{time_marker}}, I was {{mundane_action}} when {{unexpected_event}} happened",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-002",
    template:
      "The client asked for {{simple_request}}, then the whole project changed",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-003",
    template: "I opened {{tool_or_file}} and immediately knew something was wrong",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-004",
    template: "I thought {{task}} would take ten minutes, then I found {{surprise}}",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-005",
    template: "A random {{message_or_comment}} made me rethink {{topic}}",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-006",
    template: "I was about to ship {{project}} when {{problem}} showed up",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-007",
    template: "The first version looked terrible, but one detail saved it",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-008",
    template: "I ignored {{small_warning}} until it became {{big_problem}}",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-009",
    template: "The best idea came after I almost gave up on {{project}}",
  },
  {
    styleKey: "cold_open_story",
    templateId: "CS-010",
    template:
      "I showed {{thing}} to {{person_or_group}}, and their reaction changed the plan",
  },
];

export const cliprHookTemplates: CliprHookTemplate[] =
  rawCliprHookTemplates.map((template) => ({
    ...template,
    ...styleDefaults[template.styleKey],
    requiredVariables: getCliprTemplateVariables(template.template),
  }));
