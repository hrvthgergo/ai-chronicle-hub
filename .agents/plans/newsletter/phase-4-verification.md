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

1. **Simplicity UI Review**:
   - Render `index.html` in a web browser.
   - Assert that there are **zero visible lines, borders, divider rules, or card outlines** on the canvas.
   - Assert that the brand title is on a single line at the top-left in bronze serif.
2. **Dynamic Dropdown Load**:
   - Click the edition select dropdown and verify it lists all active dates specified inside `data/index.js` dynamically.
   - Swap the dropdown selection and assert that the layout clears and repopulates the category columns instantly with the select edition content.
3. **Card Layout Structure**:
   - Assert that content cards in the grid columns stack elements strictly vertically (sculpture image at the top, followed by bold serif title, key aspect summary teaser, and metadata at the bottom).
   - Assert that images are elongated rounded squircles (`border-radius: 24px` and aspect-ratio `1.5`).
   - Click a card and verify it redirects to the source URL in a new browser tab (`target="_blank"`).
4. **Soft Gold Hover Highlight**:
   - Hover over a content card and assert:
     - The hovered title text transitions to the soft quiet gold color.
     - The sculpture container displays a soft, low-contrast gold glow shadow (`box-shadow: 0 16px 48px rgba(197, 160, 89, 0.08)`).
     - No solid outlines or borders are shown.
     - **Exactly one** content card shows the active highlight state at any time.
5. **Real-time Filter Invalidation**:
   - Type in the `search...` input and assert that cards matching titles or summaries stay visible, while non-matching cards are set to `display: none` instantly.
