# Outline Companion

## What This Does

A Templater script that links chapter files to their Reverse Outline (RO) metadata files and opens them side by side. When you're editing a chapter and press the hotkey, the corresponding RO file opens in the top-right pane. When you're in an RO file and press the hotkey, the corresponding chapter opens in the left pane.

---

## File Naming Convention

The script matches files by extracting a shared key from their names. Everything after ` - ` is stripped before matching, so titles don't need to stay in sync.

| File type | Example filename |
|---|---|
| Chapter | `C01 S01 - Once Upon A Time.md` |
| Reverse Outline | `RO C01 S01 - Once Upon A Time.md` |

The extracted key in both cases is `C01 S01`.

**Folder locations (hardcoded in script):**

| File type | Folder |
|---|---|
| Chapters | `Manuscript/` |
| Reverse Outlines | `Reverse Outline/` |

---

## Hotkey

| Platform | Hotkey |
|---|---|
| Mac | `Option+Shift+U` |
| Windows | `Alt+Shift+U` |

`Alt+U` alone does not work on Mac because macOS intercepts it at the OS level to compose diacritic characters. `Alt+Shift+U` is the working alternative and is assigned in Obsidian's hotkey settings.

---  

## Expected Pane Layout

The script targets panes by position. It assumes the following layout:

```
┌─────────────────┬─────────────────┐
│ │ TOP RIGHT │
│ LEFT │ (RO files) │
│ (Chapters) ├─────────────────┤
│ │ BOTTOM RIGHT │
│ │ (Other notes) │
└─────────────────┴─────────────────┘
```

- **Chapter → RO:** opens in top-right pane
- **RO → Chapter:** opens in left pane

If you restructure the pane layout the targeting will break. See the Troubleshooting section below.

---

## Edge Cases

**No match found**
A notice appears: `Companion: No match found for "C01 S01" in Reverse Outline/`
The file simply doesn't open. Nothing else happens.

**Multiple matches found**
A notice appears: `Companion: Multiple matches for "C01 S01" — opened the first. Check your file names.`
The notice stays visible for 6 seconds. The first alphabetical match is opened. You should go fix the duplicate filenames.

**Active file is not in Manuscript/ or Reverse Outline/**
A notice appears and the script exits. The script only operates on files in those two folders.

**Pane targeting fails**
Falls back to opening in a new tab and shows a notice. This happens if the pane layout doesn't match the expected structure.

**Titles out of sync**
Intentionally handled. Everything after ` - ` is stripped before matching, so `C01 S01 - Old Title` and `C01 S01 - New Title` will still match each other correctly.

---

## Setup Instructions

### 1. Dependencies

- Obsidian (desktop)
- Templater community plugin (installed and enabled)
- **"Enable user system command functions"** must be toggled ON in Templater settings

### 2. Template file

Save the script as `Update Companion.md` inside your Templater templates folder. The file must be `.md`, not `.js`.  

### 3. Templater settings

- Settings → Templater → **Template folder location**: must include or point to the folder containing `Update Companion.md`
- Settings → Templater → **Template Hotkeys**: click `+` and select `Update Companion.md`

### 4. Hotkey

- Settings → Hotkeys → search `Update Companion`
- Assign to `Alt+Shift+U` (Mac) or `Alt+U` (Windows)
- Use the **insert** variant, not the "create new note" variant

---

## Troubleshooting

### Nothing happens when I press the hotkey

1. Check that **"Enable user system command functions"** is on in Templater settings
2. Confirm the template file is inside the configured Templater templates folder
3. Confirm it was added under **Template Hotkeys** in Templater settings by selecting the actual file (not typed manually)
4. Open Obsidian's developer console (`Ctrl+Shift+I` → Console tab) and check for red errors

### It opens in the wrong pane or a new tab

The workspace layout no longer matches what the script expects. The script reads the pane tree in this order:

- `root.children[0]` → left tab group (chapters)
- `root.children[1].children[0]` → top-right tab group (RO files)

Rebuild your layout to match the diagram above and the targeting will work again. If you want to permanently change the layout, update `getLeftLeaf()` and `getTopRightLeaf()` in the script accordingly.

### Alt+U doesn't work on Mac

Expected behavior — macOS intercepts `Alt+U` for diacritic input. Use `Alt+Shift+U` instead.

---

## Script Config Block

If you ever need to update folder names or the RO prefix, they are all in one place at the top of the script:

```javascript

const MANUSCRIPT_FOLDER = "Manuscript";

const RO_FOLDER = "Metadata";

const RO_PREFIX = "Meta ";

```

---

## How the Pane Targeting Works (Technical)

Obsidian's workspace is a tree of splits and tab groups. The script traverses this tree by index position rather than by file name or pane title, which is why the layout must stay consistent.

Each pane is a **tab group** (type: `tabs`) whose `.children` are the individual leaf objects. The script grabs `children[0]` from each tab group as the target leaf and calls `leaf.openFile(file)` followed by `app.workspace.setActiveLeaf(leaf, { focus: true })` to open the file and bring it into focus.

This approach is robust within a stable layout but will misfire if the layout is restructured, since Obsidian does not provide named or labelled pane references.
