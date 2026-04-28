# Revolver Roofing — Site Redesign

Marketing site for Revolver Roofing, built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and TypeScript.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start the Next.js dev server              |
| `pnpm build`     | Production build (Turbopack)              |
| `pnpm start`     | Serve the production build                |
| `pnpm lint`      | ESLint (flat config)                      |
| `pnpm typecheck` | `tsc --noEmit`                            |
| `pnpm test`      | Vitest unit/component tests               |
| `pnpm test:e2e`  | Playwright e2e against `next start`       |

Before the first e2e run: `pnpm exec playwright install chromium`.

## Project layout

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture overview, testing conventions, and Next.js 16-specific notes.
