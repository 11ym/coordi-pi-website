# Coordi-π project webpage

**[Open the project homepage](https://11ym.github.io/coordi-pi-website/)**

Project page for **Coordi-π: Coordination-Aware Dual-Hand Action Representation for Bimanual Dexterous Manipulation**.

This public repository contains only the website and its presentation materials: HTML, CSS, browser JavaScript, figures, demonstration videos, and website deployment configuration.

The research implementation, training code, model weights, and datasets are not included. This repository is a project webpage, not a release of the research software.

## Local preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. No package installation is required.

## Website files

- `index.html`: project description, demonstrations, and citation.
- `style.css`: responsive layout and visual styling.
- `app.js`: interactive explanations, result tables, and video galleries.
- `assets/`: materials displayed or linked by the webpage.
- `scripts/build.py` and `.github/workflows/pages.yml`: website-only deployment.

Changes to `main` deploy the website automatically to GitHub Pages. 

## Publication boundary

Only the website source and the presentation assets listed in `public-files.json` belong in this repository. Manuscripts, PDFs, research implementation, training data, model weights, credentials, and internal notes must stay outside this repository. The build rejects unlisted tracked files and deploys only the listed site files. Review new assets before adding them to the manifest.
