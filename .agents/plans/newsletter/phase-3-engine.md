# Phase 3: Ingestion & Curation Engine Specification

This document defines the requirements, logic architectures, schemas, and data pipelines powering the background ingestion engine of **ai chronicle hub**.

---

## 1. Web Crawler Ingestion (`scraper.go` in Go)
The crawler is built in Go (Golang) as a high-performance compiled binary. It crawls the web to harvest target resource URLs and registers them in our data schema.

### Crawl Scope & Configuration (`sources.json`)
The crawler reads a localized JSON configuration from the root workspace containing our systematically targeted URLs and content profiles:
- Target fields: `name`, `url`, `content_type` (supporting `article`, `podcast`, `video`, or `dashboard`).

Example of the planned `sources.json` schema:
```json
[
  {
    "name": "openai newsroom",
    "url": "https://openai.com/newsroom",
    "content_type": "article"
  },
  {
    "name": "latent space podcast",
    "url": "https://www.latentspace.fm",
    "content_type": "podcast"
  },
  {
    "name": "hugging face spaces",
    "url": "https://huggingface.co/spaces",
    "content_type": "dashboard"
  }
]
```

### Two-Stage Crawling Engine:
1. **Stage 1 (Systematic Tracker)**: Parses the exact set of preset URLs declared inside `sources.json`.
2. **Stage 2 (Discovery Spider)**: Evaluates outward references and walks secondary paths randomly to detect newly released AI guidelines, tools, or papers.
- **Harvesting constraints**:
  - The crawler only extracts the **Title** and **URL** of newly discovered content.
  - It writes a new dataset node into the designated monthly database file (`data/yyyy-mm/data-yyyy-mm-dd.json`), leaving all other fields blank for the agentic curation step.

---

## 2. Curation & Enrichment Agent (`curator.py` in Python)
The curation engine is built in Python using the **Google Antigravity SDK** (`google-antigravity`) as an autonomous supervisor.

### Extraction & Curation Pipeline:
- The agent reads the target weekly `data-yyyy-mm-dd.json` file and loops over content objects where the summary field is empty.
- For each item, it accesses the source URL using its browsing capability, crawls the raw text body, and enriches the database fields:
  - `summary`: A short, high-fidelity summary explaining the core content and key aspects of the content.
  - `labels`: Generates dynamic tag lists for index matching.
  - `author`: Extracts the original content creator.
  - `date`: Compiles the date, formatting it strictly as a timestamp with locational information (ISO 8601 format with timezone offset, e.g., `2026-06-01T11:46:36+02:00`), only the timestamp without the "- Author" part.
- **Artistic Illustration Generator**: The agent calls its image generation capability to render a custom abstract looping sculpture image matching the content's core concept. The generated image is saved in pure black, white, and grey analog tones (zero warm casts) under `assets/sculptures/`, and its local reference path is written to the `picture` field.
- **Index Management**: Appends the completed edition date to the global tracking array in `data/index.js`.

---

## 3. Data Schema & File Formats

### Month-Based Storage layout
Database files are written as JSON documents grouped inside folders by compilation month (`data/yyyy-mm/data-yyyy-mm-dd.json`) to allow direct parsing using the browser fetch API:
- **`data/index.js`**:
  ```javascript
  const availableEditions = [
    "2026-05-29",
    "2026-06-01"
  ];
  ```
- **`data/yyyy-mm/data-yyyy-mm-dd.json`**:
  ```json
  {
    "edition": "2026-06-01",
    "product and concept releases": [
      {
        "title": "aura synthesis: redefining digital experience",
        "picture": "assets/sculptures/aura_synthesis.png",
        "url": "https://openai.com/blog/aura-synthesis",
        "summary": "a detailed review of recent visual and architectural AI models that map out new latent dimensions of spatial composition.",
        "labels": ["visual modeling", "generative design"],
        "date": "2026-06-01T11:46:36+02:00",
        "author": "openai editorial"
      }
    ],
    "scientific breakthroughs": [],
    "blog posts & news": []
  }
  ```

---

## 4. Frontend Library Constraints
- To preserve the integrity and performance of the core interface, the frontend relies strictly on framework-less native Vanilla JS.
- **Library Selection Policy**: If any helper library is identified that could simplify the implementation of code complexity or state handling, it **must be presented to the user first for explicit approval** before being added to the workspace.

---

## 5. Data Flow & Interoperability Trace
The diagram below details the trace of a news payload from ingestion to DOM presentation:

```text
[sources.json] ──(Read Preset List)──> [scraper.go]
                                             │
                                   (Systematic Crawl)
                                             │
                                             ▼
                             [data/yyyy-mm/data-yyyy-mm-dd.json] 
                              (Contains only Title and URL)
                                             │
                                             ▼
          [curator.py] (Google Antigravity SDK Curation Agent)
               │
       (Browse URL & Fetch Content)
       (Enrich Summary, Labels, Author, Date)
       (Generate Sculpture Image in assets/sculptures/)
               │
               ▼
  [data/yyyy-mm/data-yyyy-mm-dd.json] ──(Update global data/index.js)
               │
               ▼
   [index.html] ──(Load data/index.js)──> [app.js]
                                              │
                                  (Select dynamic edition)
                                              │
                                              ▼
                             (fetch() loads data-yyyy-mm-dd.json)
                                              │
                                              ▼
                                (Renders Content Cards to DOM)
```
