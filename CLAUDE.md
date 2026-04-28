@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> The `@AGENTS.md` import above pulls in a critical warning: this project pins **Next.js 16.2.4**, which has breaking changes vs. older Next.js conventions in training data. Before writing routing, data-fetching, caching, or `<Image>` code, check `node_modules/next/dist/docs/` for the version-accurate guide rather than relying on memory.

## Stack

- **Next.js 16.2.4** (App Router, `src/app`) on **React 19.2.4**
- **TypeScript 5** (strict, `noEmit`, `bundler` module resolution)
- **Tailwind CSS v4** — PostCSS-only via `@tailwindcss/postcss` (see `postcss.config.mjs`); *no* `tailwind.config.ts`. Theme tokens are declared inline in CSS via `@theme inline {}` (see `src/app/globals.css`). Adding a v3-style JS config will not be picked up.
- **ESLint 9 flat config** (`eslint.config.mjs`) extending `eslint-config-next` (`core-web-vitals` + `typescript`). Default ignores are re-declared explicitly so test artifacts (`coverage/`, `playwright-report/`, `test-results/`) are also skipped.
- **Vitest 4** + React Testing Library + jsdom for unit/component tests (config: `vitest.config.ts`, setup: `vitest.setup.ts`)
- **Playwright 1** for end-to-end tests (chromium project only, `playwright.config.ts`)
- **pnpm** is the package manager. `pnpm-workspace.yaml` exists only to allowlist native build deps (`sharp`, `unrs-resolver`); this is a single-package repo, not a workspace.
- **`next.config.ts`** is currently empty (no overrides). `next build` uses Turbopack by default in Next 16.

## Commands

```bash
pnpm install                      # install deps
pnpm dev                          # next dev (http://localhost:3000)
pnpm build                        # next build (uses Turbopack)
pnpm start                        # serve the production build
pnpm lint                         # eslint (flat config, no extra args needed)
pnpm typecheck                    # tsc --noEmit
pnpm test                         # vitest run (one-shot, CI-style)
pnpm test:watch                   # vitest in watch mode
pnpm test -- src/components/__tests__/hero.test.tsx   # run a single unit test
pnpm test:e2e                     # playwright test (boots `next start` on :3100)
pnpm exec playwright test e2e/home.spec.ts            # run a single e2e spec
```

**Before the first `pnpm test:e2e` run**, install the Playwright browser binary:

```bash
pnpm exec playwright install chromium
```

This download is blocked in some sandboxes (e.g. `cdn.playwright.dev` not in the allowlist). If installation fails, e2e tests cannot run locally — unit tests, lint, typecheck, and build still cover everything else.

## Architecture

```
src/
  app/
    layout.tsx       # root layout: Geist fonts, <SiteHeader>, <main>, <SiteFooter>, site metadata
    page.tsx         # home route: composes Hero + Services + TrustStrip + CtaSection
    globals.css      # `@import "tailwindcss"` + @theme tokens + body defaults
    favicon.ico
  components/
    site-header.tsx  # sticky top nav with anchor links and "Get a Quote" CTA
    site-footer.tsx  # contact line + copyright
    hero.tsx         # H1, supporting copy, dual CTAs, decorative stat panel
    services.tsx     # 3-up grid: residential / commercial / repairs
    trust-strip.tsx  # 4-up trust signals (license, warranty, family-owned, free estimates)
    cta-section.tsx  # final dark CTA with phone + email
    __tests__/
      hero.test.tsx      # asserts H1 + primary CTA href
      services.test.tsx  # asserts the three service headings
e2e/
  home.spec.ts       # playwright smoke test against `next start`
public/              # static assets served at / (currently empty in repo)
```

Key patterns:

- **Layout owns the chrome.** `SiteHeader` and `SiteFooter` live in `app/layout.tsx`, so they persist across any future routes without duplication. New pages should render only their own sections from `page.tsx`.
- **Components are server components by default.** Nothing currently uses `"use client"`. Add the directive only when a component needs browser APIs, event handlers with state, or React hooks beyond `use()`.
- **Anchor-based nav.** The header links to `#services`, `#why-us`, and `#contact`, which match the `id`s on `<Services>`, `<TrustStrip>`, and `<CtaSection>`. If you rename a section, update the header (and any tests asserting CTA hrefs).
- **Design tokens live in CSS, not JS.** Edit the `@theme inline { ... }` block in `src/app/globals.css` to add colors/fonts; reference them as `bg-background`, `text-foreground`, `font-sans`, `font-mono`. The current tokens are `--color-background`, `--color-foreground`, `--font-sans` (Geist), and `--font-mono` (Geist Mono). Light/dark today is `prefers-color-scheme`-driven — switch to a `data-theme` or `class` strategy if you need a manual toggle.
- **Brand accent color** is Tailwind's `orange-600`/`orange-700`, applied directly via utilities (header CTA, hero CTA, contact CTA, logo swatch). It is *not* yet a token — if you need to reuse or theme it, promote it into `@theme inline`.
- **Path alias.** `@/*` resolves to `src/*` (configured in both `tsconfig.json` and `vitest.config.ts` — keep them in sync).

## Testing conventions

- **Unit tests** sit in `src/**/__tests__/*.test.tsx`, import their target with a relative path, and use `@testing-library/react` + `@testing-library/jest-dom/vitest` matchers (loaded via `vitest.setup.ts`). Prefer role-based queries (`getByRole`) over test IDs.
- **Vitest globals are enabled** (`globals: true` in `vitest.config.ts`), but the existing tests still `import { describe, expect, it } from "vitest"` explicitly for clarity and editor intellisense — match that style in new tests.
- **Test discovery**: Vitest only picks up `src/**/*.test.{ts,tsx}` (see `vitest.config.ts`). Tests outside `src/` won't run via `pnpm test`. CSS is disabled in the test environment (`css: false`) — assert behavior, not class names.
- **E2E specs** sit in `e2e/*.spec.ts`. Playwright's `webServer` config runs `pnpm exec next start -p 3100`, so it requires `pnpm build` first if you haven't already (or pass `--webServer.command="pnpm dev"` when iterating). `forbidOnly` and 2 retries are enabled when `CI` is set.
- **What to test where**: route-level smoke and navigation belong in Playwright; markup, accessibility roles, and prop variants belong in Vitest. Don't reach for Playwright when an RTL test would do.

## Conventions

- **Branch flow**: AI-assisted work lives on `claude/<topic>-<suffix>` branches and is pushed there, never directly to `main`. Merges to `main` happen via pull request.
- **`next-env.d.ts`** is generated by `next dev`/`build` and is gitignored — do not hand-edit or commit it.
- **Playwright artifacts** (`playwright-report/`, `test-results/`, `.playwright/`) are gitignored and ESLint-ignored; don't add fixtures there.
- **Env files** (`.env*`) are gitignored. Don't commit secrets; if a new env var is required, document it here and provide a `.env.example` instead.
