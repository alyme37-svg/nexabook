# NexaBook project rules

## Architecture

- Use the Next.js App Router under `src/app`; keep routes server-rendered unless interactivity requires a client boundary.
- Keep domain types and deterministic fixtures in `src/domain` and persisted client state in `src/store`.
- Reuse primitives from `src/components/ui` and shell components from `src/components/layout`; do not duplicate their styles inside pages.
- Build feature code by domain under `src/features/<feature>` when a placeholder becomes a real page.
- Import directly from implementation files instead of adding broad barrel exports.

## Product constraints

- Optimize for speed, stability, clean organization, and low-end desktop/mobile hardware.
- Use semantic tokens from `src/app/globals.css`; follow `design-system/nexabook/MASTER.md`.
- Use Lucide icons, subtle opacity/color motion, visible focus states, and reduced-motion fallbacks.
- Keep mobile targets at least 44px and bottom navigation to five top-level items.
- Persist only serializable application data. Bump the store version and add a migration when the shape changes.
- Seed/demo data must remain deterministic and preserve referential integrity.
- Do not add a backend or a dependency when a small local implementation is sufficient.

## Quality

- Keep patches focused and do not refactor unrelated code.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` after implementation.
- Replace route placeholders incrementally; do not turn `PlaceholderPage` into a feature catch-all.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
