@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> The `@AGENTS.md` import above pulls in a critical warning: this project pins **Next.js 16.2.4**, which has breaking changes vs. older Next.js conventions in training data. Before writing routing, data-fetching, caching, or `<Image>` code, check `node_modules/next/dist/docs/` for the version-accurate guide rather than relying on memory.

## Stack

- **Next.js 16.2.4** (App Router, `src/app`) on **React 19.2**
- **TypeScript 5** (strict, `noEmit`, `bundler` module resolution)
- **Tailwind CSS v4** — PostCSS-only, *no* `tailwind.config.ts`. Theme tokens are declared inline in CSS via `@theme inline {}` (see `src/app/globals.css`). Adding a v3-style JS config will not be picked up.
- **ESLint 9 flat config** (`eslint.config.mjs`) extending `eslint-config-next` (`core-web-vitals` + `typescript`)
- **Vitest 4** + React Testing Library + jsdom for unit/component tests
- **Playwright 1** for end-to-end tests (chromium project only)
- **pnpm** is the package manager. `pnpm-workspace.yaml` exists only to allowlist native build deps (`sharp`, `unrs-resolver`); this is a single-package repo, not a workspace.

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
    layout.tsx                 # root layout: fonts, <StructuredData>, <SiteHeader>, <main>, <SiteFooter>, metadata
    page.tsx                   # home route: Hero + Services + TrustStrip + CtaSection
    globals.css                # Tailwind import + @theme tokens + body defaults
    favicon.ico
    actions/
      lead.ts                  # 'use server' Server Action for the contact form
      __tests__/lead.test.ts   # action validation + delivery tests
    services/[slug]/page.tsx   # SSG service-detail pages (residential / commercial / repairs)
    areas/[slug]/page.tsx      # SSG service-area pages (tri-state)
  components/
    site-header.tsx            # sticky top nav, visible tel: link, "Get a Quote" CTA
    site-footer.tsx            # contact line + copyright (NAP from business config)
    hero.tsx                   # H1, copy, "Get a free estimate" + tel: CTA, stat panel
    services.tsx               # 3-up grid linking to /services/[slug]
    trust-strip.tsx            # 4-up trust signals (license #s, insurance, warranty, founded)
    cta-section.tsx            # final dark CTA with <LeadForm> + tel/email/hours
    lead-form.tsx              # 'use client' form using useActionState + honeypot
    structured-data.tsx        # JSON-LD <script> emitting RoofingContractor schema
    __tests__/                 # vitest specs colocated by component
  lib/
    business.ts                # SINGLE SOURCE OF TRUTH for NAP, license, hours, rating, etc.
    lead-delivery.ts           # deliverLead() — replace stub with CRM/email integration
    services-content.ts        # Service page copy keyed by slug; drives generateStaticParams
    areas-content.ts           # Area page copy keyed by slug; drives generateStaticParams
e2e/
  home.spec.ts                 # playwright smoke test against `next start`
.github/workflows/ci.yml       # CI: verify (lint/typecheck/test/build) + e2e jobs
```

There is no `public/` directory yet — the only static asset is `src/app/favicon.ico`, which Next handles via the metadata file convention. Add `public/` at the repo root if you need to serve other static files.

Key patterns:

- **Business data lives in `src/lib/business.ts`.** Phone, email, address, license numbers, hours, rating, certifications. Anything tagged `REPLACE_BEFORE_SHIPPING` is a placeholder — `grep` that string before going live. The header tel: link, footer NAP, hero copy, trust strip, CTA section, and JSON-LD all read from this file.
- **JSON-LD is rendered in `<body>` from `app/layout.tsx`.** `<StructuredData />` emits a `RoofingContractor` payload and escapes `<` to `<` per the Next.js JSON-LD guide. Validate at https://validator.schema.org/ after editing `business.ts` or `structured-data.tsx`.
- **Lead form uses Server Actions.** The `<form action={formAction}>` in `lead-form.tsx` posts to `submitLead` (`src/app/actions/lead.ts`) via `useActionState`. The action validates server-side, applies a honeypot, and hands valid leads to `deliverLead` in `src/lib/lead-delivery.ts` — that single function is the integration point for Resend / Zapier / your CRM.
- **Layout owns the chrome.** `SiteHeader`, `SiteFooter`, and `StructuredData` live in `app/layout.tsx`, so they persist across all routes. New pages render only their own sections from their `page.tsx`.
- **Components are server components by default.** `lead-form.tsx` is the only `"use client"` file (it needs `useActionState` + form state). Don't add the directive unless a component needs browser APIs, event handlers with state, or React hooks beyond `use()`.
- **Dynamic routes use Next 16 async `params`.** Pages under `[slug]/` declare `params: Promise<{ slug: string }>` and `await` it (Next 15+ change). Each dynamic route exports `generateStaticParams` and `dynamicParams = false` so unknown slugs 404 instead of attempting a runtime render.
- **Cross-page anchors use `<Link href="/#contact">`** (not `<a>`) — `eslint-config-next` flags `<a>` for any path that resolves to a Next route.
- **Design tokens live in CSS, not JS.** Edit `@theme inline { ... }` in `src/app/globals.css`; reference as `bg-background`, `text-foreground`, `font-sans`. Light/dark is `prefers-color-scheme`-driven.
- **Path alias.** `@/*` resolves to `src/*` (configured in both `tsconfig.json` and `vitest.config.ts` — keep them in sync).

## Testing conventions

- **Unit tests** sit in `src/**/__tests__/*.test.tsx`, import their target with a relative path, and use `@testing-library/react` + `@testing-library/jest-dom/vitest` matchers (loaded via `vitest.setup.ts`). Prefer role-based queries (`getByRole`) over test IDs.
- **Import test helpers explicitly.** Vitest globals are enabled (`globals: true` in `vitest.config.ts`), but every existing spec still does `import { describe, expect, it } from "vitest"`. Match that style for grep-ability and to keep tests portable if the global flag is ever flipped off.
- **E2E specs** sit in `e2e/*.spec.ts`. Playwright's `webServer` config runs `pnpm exec next start -p 3100`, so it requires `pnpm build` first if you haven't already (or pass `--webServer.command="pnpm dev"` when iterating).
- **What to test where**: route-level smoke and navigation belong in Playwright; markup, accessibility roles, and prop variants belong in Vitest. Don't reach for Playwright when an RTL test would do.
- **Server Actions in unit tests** — mock `next/headers` and the lead-delivery layer (see `src/app/actions/__tests__/lead.test.ts`). The action itself can be invoked directly with a `FormData` instance — no React rendering required.

## Conventions

- **Branch flow**: AI-assisted work lives on `claude/<topic>-<suffix>` branches and is pushed there, never directly to `main`.
- **`next-env.d.ts`** is generated by `next dev`/`build` and is gitignored — do not hand-edit or commit it.
- **Generated artifacts** (`coverage/`, `playwright-report/`, `test-results/`) are gitignored and ESLint-ignored; don't add fixtures there.
