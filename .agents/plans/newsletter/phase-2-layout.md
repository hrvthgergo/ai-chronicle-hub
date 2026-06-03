# Phase 2: Visual Layout & Appearance Specification

This document details all requirements, styling constraints, HTML semantics, and CSS instructions for the presentation layer of the **ai chronicle hub**.

---

## 1. Visual philosophy & Mockup Reference
The design is built on the philosophy of **simplicity**—eliminating boxes, borders, and separator lines to let whitespace and precise typography align elements.

The target visual appearance is defined by this mockup:

![ai chronicle hub simplicity](/Users/horvathgergo/.gemini/antigravity/scratch/ai-chronicle-hub/.agents/plans/newsletter/monochrome_abstract_sculptures.png)

---

## 2. HTML Structuring Rules & Semantic Tags
We strictly adhere to WHATWG guidelines for DOM layout structure. Standard layout divisions (`<div>` and `<span>`) are used strictly as a last resort when no semantic tag applies.
- `<header>`: Encapsulates the branding row and the search input.
- `<nav>`: Frames the navigation elements and action menus.
- `<main>`: Serves as the central wrapper for the three category columns.
- `<section>`: Houses each of the three category lists.
- `<article>`: Marks individual content cards.
- `<time>`: Used for rendering the content publication dates.
- `<select>`: Dropdown menu for swapping historical editions.
- `<a>`: Wrap each content card block with:
  ```html
  <a href="SOURCE_URL" target="_blank" rel="noopener noreferrer" class="content-card">
  ```
  This guarantees that selecting/clicking any content card dynamically redirects the user to the original content URL in a **new browser tab**.

---

## 3. Typography & Vernon Adams Fonts
We utilize Google Fonts designed by Vernon Adams to enforce a balanced combination of classical and geometric aesthetics:
1. **Tinos (Serif)**:
   - Used for the main `ai chronicle hub` branding title and article headers.
   - Styled as all-lowercase.
   - Article content titles below pictures must be styled as **bold**.
2. **Oxygen (Sans-Serif)**:
   - Used for bold column category names (`product and concept releases`, `scientific breakthroughs`, `blog posts & news` - styled strictly in all-lowercase bold), dropdown menus, search bar texts, and metadata.
   - Letter-spacing is set to a light geometric scale: `0.06em`.

---

## 4. CSS Design System & HSL Tokens
All colors are managed via custom properties inside `styles.css`.
```css
:root {
  /* Stark limestone/eggshell canvas background */
  --canvas-bg: #f5f4f0;            /* HSL: hsl(48, 16%, 95%) */

  /* Deep charcoal-black for highly readable body copy */
  --text-primary: #161616;         /* HSL: hsl(0, 0%, 9%) */

  /* Antique bronze/gold for the main single-line brand title */
  --title-bronze: #5c533c;         /* HSL: hsl(43, 21%, 30%) */

  /* Soft, quiet gold for active text hover highlights */
  --accent-gold: #c5a059;          /* HSL: hsl(40, 50%, 56%) */

  /* Semi-transparent soft gold glow shadow (8% opacity) */
  --glow-gold: rgba(197, 160, 89, 0.08);

  /* Precise transitional timing (Apple-style ease-out) */
  --transition-smooth: cubic-bezier(0.25, 1, 0.5, 1);
}
```

### Visual Styling Rules:
- **Zero Visible Borders**: No borders, horizontal rules, divider lines, or frames are allowed on the canvas. Gaps between the header, columns, and elements are implemented strictly through vertical and horizontal whitespace padding.
- **Search Bar styling**: Styled as a sharp rectangle with very subtly curved corners (`border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0.15)`).
- **Edition Dropdown menu**: Rendered as a borderless `<select>` drop-down directly beneath the page title on the left.
- **Card Vertical Stack**: Content card contents must follow a strict vertical hierarchy (Image positioned directly above words):
  1. Sculpture container.
  2. Bold serif content title (lowercase).
  3. Key summary teaser text.
  4. Date/Author metadata.

---

## 5. Continuous Squircle Image Rules
Article illustrations are centered on abstract, high-art, sculpture-based artwork in pure black, white, and grey analog tones (strictly no sepia casts, cream tints, or color parameters).
- **Apple macOS Dock Squircle Shape**: Image containers are soft rounded rectangles (`border-radius: 24px`) with squircle continuous corners, **elongated on a rectangular basis** rather than strictly square (aspect-ratio is set to a landscape scale, e.g. `aspect-ratio: 1.5`).

---

## 6. Interactive Highlights & Softer Transitions
To preserve the stark simplicity of the canvas, highlights are reserved strictly for interactive user actions.
- **Singular Hover Highlight state**: Exactly one content card shows an active hover effect at any time.
- **Transition Mechanics**:
  - The hovered card's bold title text transitions smoothly to `var(--accent-gold)`.
  - The squircle image container transitions to display an extremely soft, low-contrast, low-opacity **gold glow shadow** (`box-shadow: 0 16px 48px var(--glow-gold)`).
  - No solid outlines, borders, or high-contrast glows are rendered.
  ```css
  .sculpture-container {
    transition: box-shadow 0.4s var(--transition-smooth), transform 0.4s var(--transition-smooth);
  }
  .content-title {
    transition: color 0.3s var(--transition-smooth);
  }
  .content-card:hover .sculpture-container {
    box-shadow: 0 16px 48px var(--glow-gold);
    transform: translateY(-2px);
  }
  .content-card:hover .content-title {
    color: var(--accent-gold);
  }
  ```

---

## 7. Responsive Web Design Rules
- **Fluid Typography**: Text sizing scales dynamically with the viewport width using CSS `clamp()` (e.g., `font-size: clamp(2rem, 5vw, 3.5rem)` for the main branding title).
- **Adaptive Column Grids**: Main content columns adjust using flexible CSS Grid repeat functions (`grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`), falling back smoothly to a single-column layout on compact mobile devices.
- **Margins & Spacing**: Viewport-relative padding (`vw`, `vh`, and `rem`) scales spacing gracefully on screens ranging from small smartphones to extra-wide desktop monitors.
- **Mobile Menu Drawer**: On smaller touch viewports, the options menu transitions into a clean bottom-sheet or slide-in drawer to keep the limestone screen focused entirely on the content.
