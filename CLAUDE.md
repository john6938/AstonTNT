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
- [x] Three section pages: Research, Applications, Courses
- [x] GitHub Actions workflow for automatic deployment
- [x] Responsive collapsible navbar

### To Do
- [ ] Add real content to Research page (publications, projects, team)
- [ ] Add real content to Applications page (link to actual tools)
- [ ] Add real content to Courses page (link to course materials)
- [ ] Add profile photo/images
- [ ] Add contact information
- [ ] Configure custom domain for GitHub Pages
- [ ] Test deployment to GitHub Pages
- [ ] Consider adding more NLP demos (language detection, etc.)

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
    ├── applications/
    │   └── index.njk         # Applications section
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

---

## How to Update Navigation

Edit `src/_data/navigation.json`:
```json
{
  "main": [
    { "text": "Research", "url": "/research/" },
    { "text": "Applications", "url": "/applications/" },
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
- Dark gradient hero section (#1a1a2e → #16213e → #0f3460)
- Clean white content sections
- Bootstrap cards for section navigation
- Pink accent color (#e94560) for buttons
- Mobile-first responsive layout

### Color Palette
- Primary dark: `#1a1a2e`, `#16213e`, `#0f3460`
- Accent: `#e94560`
- Text: Bootstrap defaults (dark on light, light on dark)

---

## Future Enhancements (Ideas)

- Add language detection demo alongside sentiment
- Word cloud visualization (from old site)
- Publication list with filtering
- Course progress tracking
- Graduate student application form
- Research project showcases with demos
