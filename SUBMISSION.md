Checklist Mover — Submission metadata

This file prepares the information needed to submit `Checklist Mover` to the Obsidian community plugins list.

Repo: https://github.com/Isaiahvan/checklist-mover
Release: https://github.com/Isaiahvan/checklist-mover/releases/tag/v0.1.1
Built asset (main.js): https://github.com/Isaiahvan/checklist-mover/releases/download/v0.1.1/main.js
Screenshot (release asset): https://github.com/Isaiahvan/checklist-mover/releases/download/v0.1.1/screenshot-1.svg

Suggested `plugins.json` entry snippet (add to `obsidianmd/obsidian-releases` via PR):

{
  "id": "checklist-mover",
  "name": "Checklist Mover",
  "author": "IsaiahVan",
  "description": "Moves checked checklist items to the bottom of the list or hides completed items (configurable).",
  "version": "0.1.1",
  "minAppVersion": "0.12.0",
  "repo": "https://github.com/Isaiahvan/checklist-mover",
  "downloadUrl": "https://github.com/Isaiahvan/checklist-mover/releases/download/v0.1.1/main.js",
  "manifest": {
    "main": "main.js",
    "isDesktopOnly": false
  }
}

Checklist and next steps
- [x] Repo created and release v0.1.1 published with `main.js`, `manifest.json`, `README.md`, `LICENSE`, `screenshot-1.svg`.
- [x] README and manifest updated.
- [x] Built bundle available at release download URL above.
- [ ] (Optional) Add PNG/GIF screenshots to `assets/` for better listing.
- [ ] Create PR to `obsidianmd/obsidian-releases` adding the JSON entry above. Include screenshot URLs or release assets as needed.

If you want I can open the PR to `obsidianmd/obsidian-releases` for you, or prepare the exact commit/PR content locally and open a draft for review. If you prefer, I can also generate a PNG from the SVG and add it to the release.
