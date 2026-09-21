# AGENTS.md — miniChef

> Greenfield repo (web app / API). Stack, manifests, and tooling are not chosen yet.
> Do not invent commands, frameworks, or structure. Update this file when those land.

## State

- Stack: Vite 8 + React 19 + TypeScript (strict) + Vitest 3 + Testing Library + jsdom.
- Remote: `https://github.com/LucianoBarberis/MiniChef.git`.
- Source of truth once it exists: manifests + scripts + CI over any prose.

## Commands

- Setup: `npm install` (Node 24).
- Dev: `npm run dev`. Build: `npm run build` (`tsc -b && vite build`).
- Test: `npm test` (single run); focused: `npx vitest run <path>`; watch: `npm run test:watch`.
- `npm test` exits 1 with no test files present — expected until first `*.test.ts(x)` lands.

## Conventions

- Conventional Commits only (`feat:`, `fix:`, `docs:`, …).
- Never add `Co-Authored-By` or AI attribution to commits.

## Working rules

- After the stack is chosen, record here: exact setup / dev / test / lint commands
  (including single-test and focused-verify forms) and any required order.
- Keep entries to what an agent would likely get wrong without help.
  Omit generic advice, tutorials, and unverified claims.
