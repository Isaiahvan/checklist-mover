# Checklist Mover — Obsidian plugin

Simple plugin that moves checked todos to the bottom of their list. Optionally hide completed tasks.

Installation (manual vault install)

1. Copy the folder `checklist-mover` into your vault plugins folder:

```
<your-vault>/.obsidian/plugins/obsidian-todo-mover
```

2. In Obsidian: Settings → Community plugins → Enable community plugins → Disabled safe mode if needed. Then enable `Checklist Mover` in Installed plugins.

3. Settings: Settings → Plugin options → Todo Mover — toggle `Hide completed tasks` if you want completed todos removed.

Usage
- The plugin will automatically process markdown files when they are modified and move completed tasks to the bottom of their list.
- Use the command "Checklist Mover: Move completed items to bottom (current file)" to force processing of the active file.

Preparing for publishing

1. Install dev dependencies and build (run from the plugin repo root):

```bash
npm install
npm run build
```

This produces `main.js` (bundled) at the repository root which, together with `manifest.json`, `README.md` and `LICENSE`, is what you attach in a release for the Obsidian community or include in a plugin ZIP.

2. Create a GitHub repository for the plugin (if you haven't already), push the code, then create a release and upload the built `main.js` and `manifest.json`.

Notes about publishing
- The Obsidian community requires a GitHub repository and releases containing the plugin files. See Obsidian's submission docs for exact steps.
- If you'd like, I can run `npm install` and `npm run build` here (requires network/npm). I can also help create the GitHub repo and draft a release.
