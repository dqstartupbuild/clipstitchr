# Coding Guidelines

## Atomic Strict Code Splitting

This project strictly enforces an **Atomic Code Splitting** architecture. The fundamental rule of this codebase is: **One File, One Purpose.**

Every feature, function, component, type definition, and configuration must exist only within a single, dedicated file. 

### Core Rules

1. **Single Responsibility per File**: No file is allowed to do more than one thing. If a file is handling two different concepts or tasks, it must be split.
2. **Atomic Components**: Every UI component must live in its own file. Do not declare multiple components in the same file, even if they are internal or related.
3. **Atomic Functions**: Every distinct utility, hook, action, or helper function must reside in its own isolated file. 
4. **Types and Interfaces**: Type definitions should be kept in separate files from implementation logic, unless the type is exclusively used by and strictly coupled to the single export of that specific file.
5. **Constants**: Grouping constants is only acceptable if they are strictly related to a single atomic concept. Otherwise, split them.

### The "Why"
- **Ultimate Maintainability**: Smaller, focused files are infinitely easier to read, understand, and debug.
- **Isolated Testing**: Single-purpose files simplify unit testing by removing hidden dependencies and side effects.
- **Conflict Reduction**: Having one purpose per file drastically reduces Git merge conflicts during parallel development.

### Examples

**❌ Incorrect (Monolithic File):**
```typescript
// utils/math.ts
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const calculateTotal = (items) => /* ... */;
```

**✅ Correct (Atomic Files):**
```typescript
// utils/math/add.ts
export const add = (a, b) => a + b;

// utils/math/subtract.ts
export const subtract = (a, b) => a - b;

// utils/math/calculateTotal.ts
export const calculateTotal = (items) => /* ... */;
```

**❌ Incorrect (Multiple Components):**
```tsx
// components/ListItem.tsx
const ListItemIcon = () => <Icon />;
const ListItemText = () => <span>Text</span>;

export const ListItem = () => (
  <div>
    <ListItemIcon />
    <ListItemText />
  </div>
);
```

**✅ Correct (Atomic Components):**
```tsx
// components/ListItem/ListItemIcon.tsx
export const ListItemIcon = () => <Icon />;

// components/ListItem/ListItemText.tsx
export const ListItemText = () => <span>Text</span>;

// components/ListItem/ListItem.tsx
import { ListItemIcon } from './ListItemIcon';
import { ListItemText } from './ListItemText';

export const ListItem = () => (
  <div>
    <ListItemIcon />
    <ListItemText />
  </div>
);
```

### Enforcement
When submitting PRs or writing new code, review your files against this standard. If a file name cannot accurately and concisely describe everything inside the file without using "and", it likely needs to be split.

## Imported Postiz code exception

The Atomic Code Splitting rules apply to all ClipStitchr-owned code. They do
not require mechanical restructuring of a traceable Postiz source file inside
`web/vendor/postiz/` when preserving the upstream file shape is important for
license review or safe upstream updates.

A file qualifies for this exception only when it:

1. lives under `web/vendor/postiz/`;
2. appears in the import provenance manifest with its upstream path and audited
   source commit;
3. retains required copyright and GNU AGPL version 3 notices; and
4. records whether it is verbatim or modified, including the modification date
   and a useful summary.

The exception belongs to the imported file, not to the publishing feature.
ClipStitchr routes, adapters, Clerk tenant logic, service assertions, media
bridges, encryption, rate limits, tests, user-facing components, and deployment
code must remain outside the vendor boundary and follow one file, one purpose.
Do not add shared ClipStitchr helpers to the vendor directory. When a Postiz
file becomes a substantially rewritten ClipStitchr implementation, move the
replacement out of the import boundary and split it according to these
guidelines.

Every import or refresh must follow
`docs/architecture/postiz-publishing-source-boundary.md`. That process requires
a bounded source map, a complete provenance update, preserved legal notices,
reviewed modifications, and verification that no secrets, build artifacts,
dependencies, uploaded media, or Git metadata entered the repository.

## Progressive Disclosure and Task-Separated Workspaces

Every interface must make the user's next useful step feel smaller than the full capability of the feature. Show the shortest useful answer first, separate distinct user jobs into focused views, and reveal deeper detail only when the user asks for it or needs it.

This is an information-architecture rule, not permission to hide essential information. Users must always be able to find the complete result, understand what an action will do, and return to their work without losing context.

### Core Rules

1. **One View, One Primary Job**: Do not mix understanding, detailed inspection, creation, editing, and settings at equal visual priority in one long surface. Give each distinct job a focused view, tab, step, or mode.
2. **Shortest Useful Answer First**: Lead with the conclusion, status, summary, or most likely next action. Put supporting evidence and exhaustive detail behind clearly named secondary views or disclosures.
3. **Progressive Detail, Not Information Removal**: Keep advanced information available, complete, and easy to reach. Collapse or relocate it based on priority instead of deleting it or making it obscure.
4. **Read First, Edit Intentionally**: Present generated or saved work as clean, readable output by default. Enter form controls only after the user explicitly chooses to edit.
5. **Actions Live With Their Outcomes**: Place a primary action where the user has enough context to decide. After it runs, take the user directly to the result or resulting workspace.
6. **Protect Costly and Destructive Actions**: Never make a paid, destructive, or expensive rerun look like a harmless navigation action. If a result already exists, offer **Open** or **View** first and keep **Regenerate**, **Replace**, or **Delete** explicit and contextual.
7. **Preserve Context Across Views**: Switching tabs, modes, or disclosures must not discard drafts, scroll-independent state, selections, or generated results unless the user clearly asks to reset them.
8. **Keep Feedback Near the Action**: Loading, success, validation, and failure states belong beside the control or result they affect. Do not make users search another part of the interface to learn what happened.
9. **Use Accessible Interaction Primitives**: Tabs, dialogs, disclosures, and menus must support keyboard navigation, visible focus, correct semantics, and predictable focus return. Prefer the project's existing accessible primitives.
10. **Preserve the Hierarchy on Every Screen Size**: Mobile may stack or condense the layout, but it must keep the same task separation, primary action, readable output, and access to full detail. Do not solve density by hiding essential content.
11. **Keep Motion Supportive**: Content is visible by default. Motion may clarify a state change, but it must not gate access to content, delay the task, or become the only explanation of what changed.
12. **Verify the Real Workflow**: Test every interactive control with a pointer and keyboard at desktop and mobile sizes. Confirm that focus, overflow, scrolling, empty states, loading states, errors, completed results, editing, and return navigation all work.

### Required UI Review

Before considering an interface complete, answer all of the following:

- What is the shortest useful view of this feature?
- Which distinct user jobs are present, and are they separated?
- What information is primary, and what can be progressively disclosed?
- Is saved or generated work easy to read before it becomes a form?
- Could any costly or destructive action happen accidentally?
- Does changing views preserve the user's work and context?
- Are errors and progress shown beside the action that caused them?
- Does the hierarchy still work with a keyboard and on a narrow screen?
- Has every visible control been exercised in the browser?

If the interface opens as a wall of equally weighted content, mixes multiple jobs into one scrolling form, or makes the user parse everything before acting, it is not finished.
