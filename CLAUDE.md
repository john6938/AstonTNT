# Aston Academic Website

## Overview
Academic website for showcasing research, recruiting graduate students, and sharing applications, datasets, and courses.

## Research Areas
- Natural Language Processing
- Data Structures
- Algorithms

---

## Current Implementation Status

### Completed
- [x] 11ty static site generator setup
- [x] Bootstrap 5 (via CDN) mobile-first framework
- [x] Transformers.js sentiment analysis demo (Option B)
- [x] Data-driven navigation (`src/_data/navigation.json`)
- [x] Landing page with interactive NLP demo hero
- [x] Four section pages: Research, Supervision, Tools, Courses
- [x] GitHub Actions workflow for automatic deployment
- [x] Responsive collapsible navbar
- [x] Supervision page added to navigation
- [x] Orange color scheme (#ff8c00 accent, black navbar, #3B3B3B body)
- [x] Favicon added (favicon.ico)
- [x] pathPrefix fix: all URLs use `| url` filter for subfolder deployment
- [x] Deployed to https://john6938.github.io/AstonTNT/
- [x] Profile photo added to homepage
- [x] Publications page with full data-driven system (`publications_data/` JSON files)
  - Chronological, By Type, By Status, and Search views
  - BibTeX and APA7 auto-generation, DOI/PDF links, collapsible abstracts
  - All book chapters have `booktitle` and `editor` fields (content to be filled)
- [x] Footer quotes added
- [x] Page content updated (supervision, research, tools, courses)
- [x] Move Visualizer added to tools page (links to https://john6938.github.io/move-visualizer/)
- [x] Teacher Utilities suite (`/tools/teacher-utilities/`, 7 tools)
  - Tool 7: Virtual Board — contenteditable board with speech-to-text, per-segment font colours, three background themes (black default, green, white), colour palette + custom picker, voice colour command ("change colour to X"), language selector (EN-GB default), full-screen mode
- [x] iCALL Suite course integrated (10 units, `/courses/icall/`)
- [x] Error-Free Research Writing course (6 units, `/courses/error-free/`)
  - Bespoke landing page with interactive "spot the 5 errors" hover demo
- [x] Reader-Friendly Writing course (6 units, `/courses/reader-friendly/`)
- [x] Scientific Research Abstracts course (6 units, `/courses/scientific-abstracts/`)
  - Bespoke landing page with 6-stage abstract transformation animation
  - Auto-advances every 2 seconds; click to pause/resume; click dots to jump to any stage
  - Orange progress bar shows time to next stage; dims when paused
  - Sidebar shows four evaluation criteria (Novelty, Rigour, Substance, Significance) with abstract-specific notes; active criterion highlights on each stage

### To Do
- [ ] Fill in `booktitle` for all book chapters in `publications_data/`
- [ ] Add more tool links as new versions of tools are finalised
- [ ] Configure custom domain for GitHub Pages
- [ ] Consider adding more NLP demos (language detection, etc.)
- [ ] Update Error Detector tool URL in `src/courses/error-free/error-free.json` when new version is ready (currently pointing to https://error-detector.herokuapp.com/)
- [ ] Proofread each unit of the Error-Free Research Writing course (units 1–6)
- [ ] Proofread each unit of the Reader-Friendly Writing course (units 1–6)
- [ ] Identify content for Reader-Friendly Writing units 7–10
- [ ] Check iCALL Suite course after deploy (tools, quizzes, footer quote, sidebar nav)
- [ ] Proofread each unit of the Scientific Research Abstracts course (units 1–6)

### Course Design Issues
- [ ] Bespoke landing pages still needed for: Reader-Friendly Writing, iCALL Suite
- [ ] Decide on tool URLs for the sidebar tools list (currently placeholders)
- [ ] Add remaining activity types as macros: drag-and-drop, timer, code editor, canvas visualizer, async simulation

---

## Tech Stack (Implemented)

| Component | Choice | Notes |
|-----------|--------|-------|
| Static Site Generator | **11ty v2** | Nunjucks templates |
| CSS Framework | **Bootstrap 5** | Via CDN, mobile-first |
| NLP Demo | **Transformers.js** | Sentiment analysis, ~70MB model |
| Deployment | **GitHub Pages** | Via GitHub Actions |
| Course template | **custom** | `layouts/course-unit.njk` + `macros/course.njk` + `course.css` / `course.js` |

---

## Project Structure

```
aston_site/
├── .eleventy.js              # 11ty configuration
├── .gitignore                # Ignores node_modules, _site
├── package.json              # Dependencies
├── CLAUDE.md                 # This file
├── .github/workflows/
│   └── deploy.yml            # GitHub Pages auto-deployment
└── src/
    ├── _data/
    │   ├── navigation.json       # Menu items
    │   └── publications.js       # Publications data loader
    ├── _includes/
    │   ├── layouts/
    │   │   ├── base.njk          # Base HTML template (all pages)
    │   │   └── course-unit.njk   # Course unit layout (2-col + sidebar nav)
    │   ├── macros/
    │   │   └── course.njk        # Course activity macros (see below)
    │   ├── header.njk            # Navbar component
    │   └── footer.njk            # Footer component
    ├── assets/
    │   ├── css/
    │   │   ├── main.css          # Global styles
    │   │   └── course.css        # Course-only styles (loaded when courseUnit: true)
    │   └── js/
    │       ├── sentiment.js      # Transformers.js sentiment demo
    │       └── course.js         # Quiz check/reset logic
    ├── index.njk                 # Site landing page
    ├── research/index.njk
    ├── publications/index.njk    # Data-driven publications list
    ├── supervision/index.njk
    ├── tools/
    │   ├── index.njk
    │   └── teacher-utilities/    # 7 classroom tools (tool-01 … tool-07)
    └── courses/
        ├── index.njk             # Courses listing page
        ├── demo-course/          # Template demo (1 unit)
        ├── error-free/           # Error-Free Research Writing (6 units + bespoke index)
        ├── reader-friendly/      # Reader-Friendly Writing (6 units)
        ├── icall/                # iCALL Suite (10 units)
        └── scientific-abstracts/ # Scientific Research Abstracts (6 units + bespoke index)
```

---

## Development Commands

```bash
# Install dependencies (first time only)
npm install

# Start development server (http://localhost:8080)
npm start

# Build for production (outputs to _site/)
npm run build
```

> **WSL note:** 11ty watch mode is unreliable in WSL2. After changes, manually rebuild: `npm run build && npm start`. Hard-refresh in browser with Ctrl+Shift+R. Server may shift to port 8081 if 8080 is occupied.

---

## How to Update Navigation

Edit `src/_data/navigation.json`:
```json
{
  "main": [
    { "text": "Research", "url": "/research/" },
    { "text": "Supervision", "url": "/supervision/" },
    { "text": "Tools", "url": "/tools/" },
    { "text": "Courses", "url": "/courses/" }
  ]
}
```

---

## How to Add New Pages

1. Create a new `.njk` file in the appropriate directory
2. Add frontmatter at the top:
```yaml
---
layout: layouts/base.njk
title: Page Title
---
```
3. Add your HTML content below the frontmatter
4. If needed, add to navigation.json

---

## Course Template System

### How it works
- `layouts/course-unit.njk` provides the two-column layout (col-lg-9 content + col-lg-3 sticky sidebar)
- Each course has a directory data file (e.g. `scientific-abstracts.json`) that injects shared frontmatter into every unit in that folder: `layout`, `courseTitle`, `courseBaseUrl`, `unitCount`, `unitTitles`, `quote`, `courseTools`
- `course.css` and `course.js` are loaded only on pages with `courseUnit: true`

### Available macros (`macros/course.njk`)

| Macro | Purpose |
|-------|---------|
| `activitySection(num, title, icon)` | Numbered activity card with Bootstrap Icon |
| `reviewSection()` | End-of-unit review card with orange left border |
| `accordion(id, question)` | Single Bootstrap accordion item (wrap multiple in `<div class="accordion">`) |
| `quizMC(id, question, correctIndex, explanation)` | Multiple-choice quiz with instant feedback |
| `tabSet(id, tabItems)` | Tabbed content panel; `tabItems` is array of `{id, label}` |
| `audioPlayer(src, caption)` | HTML5 audio with caption |
| `videoEmbed(youtubeId, caption)` | Responsive YouTube iframe |
| `toolSection(title)` | Highlighted card for embedded JS tools (iCALL style) |

### Adding a new course
1. Create `src/courses/<slug>/` directory
2. Add `<slug>.json` with `layout`, `courseTitle`, `courseBaseUrl`, `unitCount`, `unitTitles`, `quote`
3. Add `index.njk` (bespoke landing page) with `layout: layouts/base.njk`
4. Add `unit-01.njk` … `unit-NN.njk` with frontmatter: `unit`, `unitTitle`, `title`, `courseUnit: true`, `objectives`
5. Add a card to `src/courses/index.njk`

### Bespoke course landing pages
Two courses have custom landing pages with interactive demos:

**Error-Free Research Writing** (`error-free/index.njk`):
- Hover/click to discover 5 language errors hidden in a sample abstract
- CSS prefix: `efrw-`; JS: inline IIFE

**Scientific Research Abstracts** (`scientific-abstracts/index.njk`):
- 6-stage abstract transformation animation (bad draft → fully annotated)
- Stage data stored in hidden `#sa-stages > div` elements; JS swaps innerHTML on advance
- Auto-advances every 2 s; click abstract to pause/resume; click dots to jump
- Orange progress bar (`sra-progress-bar`) restarts on each advance
- Sidebar shows four evaluation criteria (Novelty, Rigour, Substance, Significance); active card highlights to match current stage colour
- CSS prefix: `sra-`; JS: inline IIFE
- Colour scheme: novelty=#ff9f40, purpose=#9c6cd4, rigour=#2979d8, substance=#2ecc71, significance=#00acc1

---

## Sentiment Demo Notes

- **Model**: `Xenova/distilbert-base-uncased-finetuned-sst-2-english`
- **Size**: ~70MB (downloaded on first use, then cached)
- **Location**: `src/assets/js/sentiment.js`
- Runs entirely in browser via WebAssembly
- No server-side processing required

---

## GitHub Pages Deployment

The site auto-deploys when you push to `master` or `main` branch.

To enable GitHub Pages:
1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Push a commit to trigger deployment

---

## Design Direction

### Implemented Style
- Black navbar with bold "John Blake" brand (white nav links)
- Dark body background (#3B3B3B)
- Orange (#ff8c00) headings (h1, h2, h3) and buttons
- Demo card background: #808080
- Bootstrap cards for section navigation
- Mobile-first responsive layout

### Color Palette
- Navbar: `#000000`
- Body background: `#3B3B3B`
- Accent / buttons / headings: `#ff8c00`
- Demo card: `#808080`
- Text: Bootstrap defaults (light on dark)

---

## Future Enhancements (Ideas)

- Add language detection demo alongside sentiment
- Word cloud visualization (from old site)
- Course progress tracking
- Graduate student application form
- Research project showcases with demos
