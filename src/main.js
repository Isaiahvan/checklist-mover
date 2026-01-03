const { Plugin, PluginSettingTab, Setting } = require('obsidian');

const DEFAULT_SETTINGS = {
  hideCompleted: false
};

module.exports = class TodoMoverPlugin extends Plugin {
  async onload() {
    // load plugin data: { settings, hidden }
    this.data = await this.loadData() || {};
    this.data.settings = Object.assign({}, DEFAULT_SETTINGS, this.data.settings || {});
    this.data.hidden = this.data.hidden || {};
    this.settings = this.data.settings;
    this.processing = new Set();

    this.addSettingTab(new TodoMoverSettingTab(this.app, this));

    this.registerEvent(this.app.vault.on('modify', (file) => this.onFileModify(file)));

    this.addCommand({
      id: 'checklist-mover:move-completed-items',
      name: 'Checklist Mover: Move completed items to bottom (current file)',
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        if (file) await this.processFile(file);
      }
    });

    this.addCommand({
      id: 'checklist-mover:toggle-hide',
      name: 'Checklist Mover: Toggle hide completed',
      callback: async () => {
        this.settings.hideCompleted = !this.settings.hideCompleted;
        this.data.settings = this.settings;
        await this.saveData(this.data);
        const file = this.app.workspace.getActiveFile();
        if (file) await this.processFile(file);
      }
    });
  }

  onunload() {}

  async onFileModify(file) {
    try {
      if (!file || file.extension !== 'md') return;
      if (this.processing.has(file.path)) return;
      await this.processFile(file);
    } catch (e) {
      console.error('TodoMover error', e);
    }
  }

  async processFile(file) {
    this.processing.add(file.path);
    try {
      const content = await this.app.vault.read(file);
      const newContent = this.reorderContent(content, file.path);
      if (newContent !== content) {
        await this.app.vault.modify(file, newContent);
      }
    } finally {
      this.processing.delete(file.path);
    }
  }

  reorderContent(content, filePath) {
    const origLines = content.split(/\r?\n/);
    const kept = new Array(origLines.length).fill(false);
    const resultLines = [];
    const MARKER_RE = /^\s*<!--\s*TODO-MOVER:\s*(hide|move)\s*-->\s*$/i;

    // ensure hidden storage exists
    this.data.hidden = this.data.hidden || {};
    const hiddenForFile = this.data.hidden[filePath] || [];

    let i = 0;
    while (i < origLines.length) {
      const startMatch = origLines[i].match(/^(\s*[-*+]\s\[( |x|X)\]\s)(.*)$/);
      if (startMatch) {
        const start = i;
        const blockIndices = [];
        while (i < origLines.length) {
          const m = origLines[i].match(/^(\s*[-*+]\s\[( |x|X)\]\s)(.*)$/);
          if (m) {
            blockIndices.push(i);
            i++;
            continue;
          }
          break;
        }

        // detect per-list override marker on the line immediately above the list
        let override = null;
        if (start > 0) {
          const prev = origLines[start - 1].match(MARKER_RE);
          if (prev) override = prev[1].toLowerCase();
        }

        const hideForThisBlock = override === 'hide' ? true : (override === 'move' ? false : this.settings.hideCompleted);

        const unchecked = [];
        const checkedEntries = [];

        for (const idx of blockIndices) {
          const m = origLines[idx].match(/^(\s*[-*+]\s\[( |x|X)\]\s)(.*)$/);
          const raw = origLines[idx];
          const checked = m[2].toLowerCase() === 'x';
          if (checked && hideForThisBlock) {
            checkedEntries.push({ index: idx, text: raw });
            kept[idx] = false;
          } else if (checked && !hideForThisBlock) {
            // will be moved to bottom of block later (keep order)
            checkedEntries.push({ index: idx, text: raw });
            // mark as kept so non-removed
            kept[idx] = true;
          } else {
            unchecked.push(raw);
            kept[idx] = true;
          }
        }

        if (hideForThisBlock) {
          // remove checked items (they're recorded in checkedEntries)
          resultLines.push(...unchecked);
          // append recorded hidden entries to stored list
          if (checkedEntries.length > 0) {
            // merge into existing hidden list for this file
            this.data.hidden[filePath] = (this.data.hidden[filePath] || []).concat(checkedEntries);
          }
        } else {
          // move mode: unchecked then checked
          resultLines.push(...unchecked);
          resultLines.push(...checkedEntries.map(e => e.text));
        }

      } else {
        // non-list line: keep as-is
        resultLines.push(origLines[i]);
        kept[i] = true;
        i++;
      }
    }

    // If hideCompleted is false, and we have stored hidden items for this file, reinsert them at their original positions
    if (!this.settings.hideCompleted && filePath && this.data.hidden[filePath] && this.data.hidden[filePath].length) {
      // Ensure entries are sorted by original index
      const entries = this.data.hidden[filePath].slice().sort((a, b) => a.index - b.index);

      // For each entry compute insertion position based on how many kept lines exist before its original index
      for (const entry of entries) {
        const insertPos = kept.slice(0, entry.index).filter(Boolean).length;
        // clamp insert position
        const pos = Math.min(Math.max(0, insertPos), resultLines.length);
        resultLines.splice(pos, 0, entry.text);
        // mark as kept (not strictly necessary now)
      }

      // clear stored hidden entries for this file
      delete this.data.hidden[filePath];
    }

    // persist any changes to hidden storage
    this.saveData(this.data);

    return resultLines.join('\n');
  }

  async saveSettings() {
    this.data.settings = this.settings;
    await this.saveData(this.data);
  }
}

class TodoMoverSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Checklist Mover settings' });

    new Setting(containerEl)
      .setName('Hide completed tasks')
      .setDesc('When enabled, completed tasks are removed instead of moved to the bottom.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hideCompleted)
        .onChange(async (value) => {
          this.plugin.settings.hideCompleted = value;
          await this.plugin.saveSettings();
        }));
  }
}
