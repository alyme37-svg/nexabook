# NexaBook design system

This file is the visual source of truth for the product foundation. Page-specific files under `pages/` may extend it, but should not redefine global tokens without an explicit design-system change.

## Direction

NexaBook is a calm, premium service-business workspace. The visual reference—not the initial generator output—sets the direction: cool-white surfaces, deep navy text, indigo action color, compact operational density, fine borders, quiet elevation, and generous page-level whitespace. Avoid gold/luxury-editorial styling, ornamental glass effects, and animation-led layouts.

The signature detail is a restrained indigo-to-violet edge glow used only for the brand mark, primary action, focus ring, and active navigation indicator.

## Tokens

| Role | Value | Use |
|---|---:|---|
| Canvas | `#f6f7fc` | App background |
| Surface | `#ffffff` | Cards, sidebar, overlays |
| Surface subdued | `#f8f9fd` | Inset and hover states |
| Ink | `#11152f` | Headings and primary text |
| Muted ink | `#5e6685` | Supporting text |
| Border | `#e3e6f1` | Dividers and control outlines |
| Indigo | `#4f46e5` | Primary action and active state |
| Violet | `#7c3aed` | Supporting gradient endpoint only |
| Success | `#15803d` | Confirmed/active state |
| Warning | `#b45309` | Pending state |
| Danger | `#c2414c` | Destructive/cancelled state |

- Spacing follows a 4px base: `4, 8, 12, 16, 24, 32, 40, 48`.
- Corners: `8px` controls, `12px` compact cards, `16px` primary cards, `20px` overlays.
- Elevation: cards use borders; floating menus and overlays use one restrained cool shadow.
- Typography: native UI sans stack for zero font-download cost. Display `32/38 700`, page title `24/30 700`, section title `16/24 650`, body `14/22 400`, label `12/16 600`.
- Data uses tabular figures. Editable controls remain at least `16px` on mobile to avoid input zoom.

## Layout

- Desktop: fixed `240px` sidebar, `64px` header, fluid content capped at `1440px`.
- Tablet/mobile: no desktop rail; `60px` header plus five-item bottom navigation with safe-area padding.
- Page gutters: `16px` mobile, `24px` tablet, `32px` desktop.
- Dense tables use `48px` rows on desktop and scroll horizontally only inside their bounded region when unavoidable.

## Components

- Cards are white with a one-pixel border. Do not give every card a shadow or hover lift.
- Buttons have one clear primary gradient, quiet secondary/outline variants, and stable pressed states without layout shift.
- Inputs use visible labels, 44px mobile height, and a 3px translucent indigo focus ring.
- Status badges always include readable text and may include an icon or dot; color is not the only signal.
- Dialogs center on desktop. Sheets enter from the right; mobile navigation sheets enter from the left.
- Skeletons reserve final layout space. Empty states state what is missing and offer one relevant next action.

## Motion and accessibility

- Only opacity and transform may animate. Use `120ms` for press/hover feedback and `180ms` for overlays.
- Disable nonessential transitions for `prefers-reduced-motion`.
- Use sequential headings, semantic controls, a skip link, descriptive icon-button labels, and visible keyboard focus.
- Maintain at least 4.5:1 text contrast and do not rely on color alone for state.
- Test layouts at 375px, 768px, 1024px, and 1440px without horizontal page overflow.
