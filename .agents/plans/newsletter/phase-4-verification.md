# Phase 4: Step-by-Step Verification Plan

This document details the manual and automated validation tests required to verify the implementation of **ai chronicle hub**.

---

## 1. Isolated Backend & Logic Verification

### Go Scraper Crawler Verification
1. **Compilation Check**:
   - Compile the Go code into a local executable binary:
     ```bash
     go build -o scraper scraper.go
     ```
   - Assert that the compiler finishes without warnings or module resolving errors.
2. **Run Execution Check**:
   - Launch the scraper binary:
     ```bash
     ./scraper
     ```
   - Verify it successfully accesses the URLs listed inside `sources.json`.
   - Verify that it outputs a new draft file `data/[yyyy-mm]/data-yyyy-mm-dd.json` containing only the crawled content titles and URLs.

### Python Curation Agent Verification
1. **Environment Setup**:
   - Confirm Python dependencies are loaded:
     ```bash
     pip install -r requirements.txt
     ```
2. **Curation Execution Check**:
   - Execute the curation agent script:
     ```bash
     python3 curator.py
     ```
   - Verify the script parses the target JSON database file, fetches raw source texts from the URLs, enriches missing fields (`summary`, `labels`, `author`, `date`), and creates a monochrome abstract sculpture PNG inside `assets/sculptures/`.
   - Verify that it registers the edition date string inside `data/index.js`.

---

## 2. API & Integration Checks
- Verify that historical edition entries inside `data/index.js` are formatted as unique strings and do not cause collisions.
- Verify that network timeout handlers inside `scraper.go` and `curator.py` exit gracefully without writing half-formed data blocks.

---

## 3. Frontend & DOM Assertions

### 3.1 Visual Design & Layout Assertions
1. **Simplicity UI Review**:
   - Render `index.html` in a web browser.
   - Assert that there are **zero visible lines, borders, divider rules, or card outlines** on the canvas.
   - Assert that the brand title is on a single line at the top-left in bronze serif.
2. **Dynamic Dropdown Load**:
   - Click the edition select dropdown and verify it lists all active dates specified inside `data/index.js` dynamically.
   - Swap the dropdown selection and assert that the layout clears and repopulates the category columns instantly with the select edition content.
3. **Card Layout Structure**:
   - Assert that content cards in the grid columns stack elements strictly vertically (sculpture image at the top, followed by bold serif title with an actionable link anchor, key aspect summary teaser, and metadata at the bottom).
   - Assert that images are elongated rounded squircles (`border-radius: 24px` and aspect-ratio `1.5`).
   - Click a card title link and verify it redirects to the source URL in a new browser tab (`target="_blank"`).
4. **Soft Gold Hover Highlight**:
   - Hover over a content card and assert:
     - The hovered title text transitions to the soft quiet gold color.
     - The sculpture container displays a soft, low-contrast gold glow shadow (`box-shadow: 0 16px 48px rgba(197, 160, 89, 0.08)`).
     - No solid outlines or borders are shown.
     - **Exactly one** content card shows the active highlight state at any time.
5. **Real-time Filter Invalidation**:
   - Type in the `search...` input and assert that matching cards across current and historical issues are retrieved and displayed, while non-matching cards are hidden.

### 3.2 Responsive Design & Device Verification
Verify layout responsiveness and fluid viewport scaling by simulating target device profiles in Chrome Developer Tools:

#### Chrome DevTools Setup Procedure:
1. Open the built application in Google Chrome.
2. Press `F12` or `Cmd + Option + I` to open Chrome Developer Tools.
3. Click the **Toggle device toolbar** button (or press `Cmd + Shift + M`).
4. Select the target devices from the device dropdown list. (If any device profile is missing, click "Edit..." at the bottom of the list and check the respective model).

#### Device-Specific Test Assertions:

1. **Pixel 7 (Compact Mobile - 412 x 915 px)**
   - **Grid Collapse**: Assert that the three category columns wrap and stack vertically into a single column.
   - **Mobile Options Menu**: Assert that the historical edition selector and option controls transition from a header block into a mobile-friendly bottom-sheet drawer.
   - **Font Scaling**: Verify that the main branding title uses CSS `clamp()` to scale down to fit the narrow viewport width on a single line without clipping.
   - **No Horizontal Scroll**: Assert that no element causes overflow, leaving the horizontal scrollbar disabled.

2. **Asus Zenbook Fold (Foldable Screen - 850 x 1280 px)**
   - **Adaptive Column Spans**: Verify the layout in both folded (narrow double-column or single-column depending on aspect) and flat tablet states.
   - **Touch Targets**: Assert that interactive target zones (like links, search input, and edition select dropdown) maintain a minimum footprint of `44 x 44 px` with clean spacing to prevent accidental mis-taps.
   - **Elastic Grids**: Ensure container width handles the folding crease aspect ratio dynamically without layout shifts or text wrapping overlaps.

3. **iPad Pro (Large Tablet - 1024 x 1366 px)**
   - **Portrait Verification (1024 x 1366 px)**: Assert that columns adapt gracefully (either reflow to 2 columns or remain in a readable 3-column layout depending on grid space minmax settings) without clipping card summaries.
   - **Landscape Verification (1366 x 1024 px)**: Assert that the 3-column category grid displays side-by-side with full readability.
   - **Spacing Integrity**: Verify margins and padding scale using viewport-relative units (`vw`, `vh`) and remain visually balanced.

4. **Nest Hub Max (Smart Display / Desktop - 1280 x 800 px)**
   - **Grid Alignment**: Verify the three category columns render in a side-by-side layout, filling the screen width evenly.
   - **Typography Scaling**: Assert that the fluid clamp sizes scale fonts up appropriately to remain readable from a typical smart display distance (~1.5 meters).
   - **Borders & Spaces**: Verify that separation is achieved purely through blank whitespace, maintaining the strict simplicity rule.
