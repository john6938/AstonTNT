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

### To Do
- [ ] Fill in `booktitle` for all book chapters in `publications_data/`
- [ ] Add links to all tools (only New Pronunciation Scaffolder linked so far)
- [ ] Add real content to Courses page (link to course materials)
- [ ] Configure custom domain for GitHub Pages
- [ ] Consider adding more NLP demos (language detection, etc.)

### Course Design Issues
- [ ] Create bespoke landing pages for each course (currently the template only covers unit pages)
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

---

## Project Structure

```
aston_site/
├── .eleventy.js              # 11ty configuration
├── .gitignore                # Ignores node_modules, _site
├── package.json              # Dependencies
├── index-old.html            # Original site (reference)
├── CLAUDE.md                 # This file
├── .github/workflows/
│   └── deploy.yml            # GitHub Pages auto-deployment
└── src/
    ├── _data/
    │   └── navigation.json   # Menu items (edit here to update nav)
    ├── _includes/
    │   ├── layouts/
    │   │   └── base.njk      # Base HTML template
    │   ├── header.njk        # Navbar component
    │   └── footer.njk        # Footer component
    ├── assets/
    │   ├── css/
    │   │   └── main.css      # Custom styles
    │   └── js/
    │       └── sentiment.js  # Transformers.js sentiment demo
    ├── index.njk             # Landing page
    ├── research/
    │   └── index.njk         # Research section
    ├── publications/
    │   └── index.njk         # Publications list (data-driven)
    ├── supervision/
    │   └── index.njk         # Supervision/graduate students section
    ├── tools/
    │   └── index.njk         # Tools section
    └── courses/
        └── index.njk         # Courses section
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
