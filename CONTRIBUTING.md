# Contributing to ClipStitchr

Thanks for helping improve ClipStitchr.

## Before you begin

- Read the [Code of Conduct](CODE_OF_CONDUCT.md).
- Review [AGENTS.md](AGENTS.md) and [coding-guidelines.md](coding-guidelines.md).
- Search existing issues and pull requests before starting work.
- For security problems, follow [SECURITY.md](SECURITY.md) instead of opening a
  public issue.

## Local setup

The application lives in `web/` and uses npm.

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Use placeholder values only for local configuration. Never commit secrets,
uploaded media, generated outputs, or `.env.local` files.

## Making a change

1. Create a focused branch from the latest default branch.
2. Keep each file to one clear responsibility and place new files in the
   closest relevant directory.
3. Add or update the documentation that describes the changed capability.
4. Use simple, clear language for anything users will read.
5. Keep changes small enough to review easily.

## Checks before opening a pull request

Run the relevant checks from `web/`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Explain any check that you could not run. Include tests for behavior changes and
screenshots or a short recording for user-interface changes.

## Pull requests

Describe what changed, why it changed, and how you tested it. Keep unrelated
refactors out of the same pull request. Do not include private credentials,
customer data, or brand assets that you do not have permission to contribute.

By contributing, you agree that your contribution may be distributed under the
[MIT License](LICENSE).
