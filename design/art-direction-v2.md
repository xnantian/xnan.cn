# xnan.cn Art Direction V2

## User And Context

- Audience: enterprise owners, digital transformation leaders, IT leaders, and business operators.
- Goal: understand the service within one viewport, inspect delivery credibility, then start a phone or WeChat conversation.
- Context: desktop-first evaluation with a complete mobile path; no account, form, loading, or backend state.

## Primary Flow

`Hero positioning -> capability fit -> system credibility -> industry scenario -> delivery confidence -> contact`

- Navigation and all section links must work with keyboard and touch.
- Mobile navigation is dismissible by link selection, Escape, and viewport resize.
- WeChat copy provides success or manual-copy feedback through a live region.

## Art Direction

Theme: **Future Industrial Editorial**.

- Use the command-center image as a full-bleed documentary backdrop, not a framed product card.
- Combine monumental Chinese serif headlines with restrained grotesk body text and mono metadata.
- Prefer asymmetric editorial grids, visible rules, sequence numbers, and large quiet surfaces.
- Use mineral black, oxidized silver, cool cyan, signal orange, and one chartreuse safety accent.
- Avoid decorative gradients, floating blobs, excessive shadows, nested cards, and generic AI glassmorphism.

## Component Rules

### Hero

- Literal service H1 remains the first-viewport signal.
- Image remains inspectable on the right while text stays readable on the left.
- Primary and secondary actions remain visible at 1280 x 720.
- Decorative typography is ignored by assistive technology.

### Capability Gallery

- Four repeated services use an asymmetric 7/5 and 5/7 grid.
- Large sequence numbers provide rhythm; lists stay scannable.
- Hover changes color and rule position without resizing layout.

### Architecture Map

- Five layers remain semantic text, not an image.
- The business-tool layer is visibly emphasized.
- Motion is ambient only and never required to understand the system.

### Contact

- Phone and WeChat remain the two primary exits.
- Buttons remain at least 44px tall and preserve clear focus states.

## Tokens

- Ink: `#071012`; paper: `#f0f1ed`; white: `#fbfcf8`.
- Cyan: `#31d7d0`; orange: `#ff5b35`; chartreuse: `#d9ff67`.
- Rules: `rgba(7, 16, 18, 0.18)` on light and `rgba(255, 255, 255, 0.18)` on dark.
- Radius: 0-8px; shadows reserved for functional overlays.
- Motion: 180ms interaction, 700ms section reveal; disabled under `prefers-reduced-motion`.

## Responsive Acceptance

- No horizontal overflow at 375, 768, 1280, or 1440 widths.
- Hero title wraps without clipping; next section remains visible on common laptop heights.
- Editorial grids collapse to one column below 900px.
- Mobile controls do not overlap page content.
- Page remains fully usable without JavaScript except mobile navigation and copy feedback.

## Implementation Target

Static HTML/CSS/JavaScript is the correct surface because the site has no SSR, API, or application state requirements. Acceptance requires valid interactions, console-clean rendering, responsive screenshots, keyboard focus visibility, and reduced-motion support.
