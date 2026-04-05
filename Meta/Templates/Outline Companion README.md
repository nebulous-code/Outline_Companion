# Outline Companion

A toolkit for writers using Obsidian. Outline Companion links your chapter files to their metadata files and keeps them open side by side as you write. When you switch chapters, one keystroke pulls up the matching metadata. If the metadata doesn't exist yet, it creates it for you.

---

## What's Included

| File | Purpose |
|---|---|
| `Outline Companion Config.js` | All your settings in one place |
| `Outline Companion.md` | Opens the companion file for whatever you're editing |
| `Outline Companion New Chapter.md` | Creates a new chapter and metadata file together |
| `Outline Companion Debug.md` | Validates your setup and helps troubleshoot problems |

---

## How It Works

Outline Companion matches chapter files to metadata files by extracting a shared **key** from each filename. It strips the metadata prefix and everything after the separator character, then matches what's left.

**Example with default settings:**

| File | Key extracted |
|---|---|
| `C01 S01 - Once Upon A Time.md` | `C01 S01` |
| `RO C01 S01 - Once Upon A Time.md` | `C01 S01` |

Because both files produce the same key, the script knows they belong together. Titles don't need to match — only the key matters.

**Expected pane layout:**

```
┌─────────────────┬─────────────────┐
│                 │   TOP RIGHT     │
│      LEFT       │ (Metadata files)│
│  (Chapters)     ├─────────────────┤
│                 │  BOTTOM RIGHT   │
│                 │  (Other notes)  │
└─────────────────┴─────────────────┘
```

- When you're in a **chapter**, pressing the hotkey opens the matching metadata file in the **top-right pane**
- When you're in a **metadata file**, pressing the hotkey opens the matching chapter in the **left pane**

The script targets panes by their position in this layout. If you restructure your panes, the targeting may break. See the Troubleshooting section.

---

## Requirements

- Obsidian (desktop only — pane splitting is not supported on mobile)
- [Templater](https://obsidian.md/plugins?id=templater-obsidian) community plugin

---

## Installation

### Step 1 — Install Templater

1. Open Obsidian Settings → Community Plugins
2. Click Browse and search for **Templater** by SilentVoid
3. Click Install, then Enable

### Step 2 — Copy the script files

Copy all four Outline Companion files into your vault. A folder like `Templates/Outline Companion/` works well, but the location is up to you.

### Step 3 — Configure Templater

Open Settings → Templater and set the following:

**Template folder location**
Point this to the folder containing the four Outline Companion `.md` files.

**User script functions folder**
Point this to the folder containing `Outline Companion Config.js`. This can be the same folder as your templates or a separate scripts folder.

**Enable user system command functions**
Toggle this **on**. Without it, the scripts will not run.

### Step 4 — Edit the config file

Open `Outline Companion Config.js` in any text editor (or in Obsidian) and update the values to match your vault. The settings are explained below.

### Step 5 — Register the scripts in Templater

For each `.md` script you want to use:

1. Go to Settings → Templater → **Template Hotkeys**
2. Click the `+` button
3. Browse to and select the script file

This registers the script as a command in Obsidian.

### Step 6 — Assign hotkeys

1. Go to Settings → Hotkeys
2. Search for the script name (e.g. `Outline Companion`)
3. Assign your preferred hotkey to the **insert** variant of the command (not "create new note")

**Recommended hotkeys:**

| Script | Suggested hotkey |
|---|---|
| Outline Companion (Update) | `Alt+Shift+U` |
| Outline Companion New Chapter | `Alt+Shift+N` |

> **Mac users:** `Alt+U` alone does not work on Mac. macOS intercepts it to compose diacritic characters. Use `Alt+Shift+U` instead. This applies to many `Alt+letter` combinations — if a hotkey doesn't respond, try adding `Shift`.

### Step 7 — Run the Debug script

Before using the toolkit for real, run the Debug script to confirm everything is set up correctly:

1. Open the Obsidian command palette (`Cmd+P` or `Ctrl+P`)
2. Search for `Outline Companion Debug`
3. Select it and press Enter

A report file will be created and opened automatically. Read the Summary section at the bottom — it will tell you if anything needs to be fixed.

---

## Configuration Reference

All settings live in `Outline Companion Config.js`. Open it in any text editor to make changes. After saving, reload Obsidian (or disable and re-enable Templater) for changes to take effect.

---

### CHAPTER_FOLDER
The vault-relative path to your chapter/manuscript folder.
```
CHAPTER_FOLDER: "Manuscript",
```
Do not include a leading or trailing slash.

---

### METADATA_FOLDER
The vault-relative path to your metadata/outline folder.
```
METADATA_FOLDER: "Reverse Outline",
```

---

### METADATA_PREFIX
The prefix applied to metadata filenames. Must match exactly, including any spaces.
```
METADATA_PREFIX: "RO ",
```
If your metadata files are named `META Chapter 1.md`, set this to `"META "`.

---

### SPLIT_CHAR
The string that separates the key from the title in your filenames.
```
SPLIT_CHAR: " - ",
```
Everything before this character sequence becomes the key used for matching. Everything after it is ignored.

Set to `""` (empty string) to skip splitting entirely and use the full filename (minus the prefix) as the key.

---

### NOTICE_DURATION
How long notification messages stay on screen, in milliseconds.
```
NOTICE_DURATION: 10000,
```

| Value | Behavior |
|---|---|
| `10000` | 10 seconds (default) |
| `5000` | 5 seconds |
| `0` | Stays open until you click it |
| `null` | Uses Obsidian's default (~5 seconds) |

---

### LOG_LEVEL
Controls how much feedback the scripts give during normal use.
```
LOG_LEVEL: "normal",
```

| Value | What you see |
|---|---|
| `"silent"` | Only errors and file creation events |
| `"normal"` | Warnings and file creation events (recommended) |
| `"verbose"` | Adds a confirmation when a file is found and opened |
| `"debug"` | Step-by-step notices — useful during initial setup |

---

### CREATE_DIRECTION
Controls whether the Update Companion script creates missing files, and in which direction.
```
CREATE_DIRECTION: "both",
```

| Value | Behavior |
|---|---|
| `"both"` | Creates whichever companion file is missing in either direction |
| `"metadata-only"` | Only creates metadata files — never creates chapter files |
| `"chapter-only"` | Only creates chapter files — never creates metadata files |

When a file is created, a notification is always shown regardless of `LOG_LEVEL`.

---

### PANE_FALLBACK
What to do if the script cannot find the expected pane.
```
PANE_FALLBACK: "new-tab",
```

| Value | Behavior |
|---|---|
| `"new-tab"` | Opens the file in a new tab (safe default) |
| `"none"` | Shows a notice and does nothing |

---

### CHAPTER_TEMPLATE
The vault-relative path to your chapter template file, used by the New Chapter script.
```
CHAPTER_TEMPLATE: "Templates/Chapter Template.md",
```
Set to `""` to create blank chapter files instead of using a template.

---

### METADATA_TEMPLATE
The vault-relative path to your metadata template file, used by the New Chapter script.
```
METADATA_TEMPLATE: "Templates/Metadata Template.md",
```
Set to `""` to create blank metadata files instead of using a template.

---

### DEBUG_OUTPUT_FOLDER
The folder where the Debug script writes its report files.
```
DEBUG_OUTPUT_FOLDER: "",
```
Set to `""` to write reports to the vault root. Reports are named with a timestamp and can be deleted at any time.

---

## Script Reference

### Update Companion

Opens the companion file for whatever you're currently editing.

- In a chapter → opens the matching metadata file in the top-right pane
- In a metadata file → opens the matching chapter in the left pane
- If no match is found → creates the missing file (subject to `CREATE_DIRECTION`) and opens it
- If multiple matches are found → opens the first alphabetically and shows a warning

**When to use:** Any time you switch chapters and want the matching metadata pulled up.

---

### New Chapter

Creates a new chapter file and a new metadata file together.

You'll be prompted for:
1. **Key** — the shared identifier (e.g. `C01 S01`, `Chapter 1`, `Part Two`)
2. **Title** — optional, leave blank to skip

Files are named using your configured prefix, split character, and templates. Both files open in the correct panes automatically.

If either file already exists, the script cancels without overwriting anything.

**When to use:** Starting a new chapter or scene from scratch.

---

### Debug

Validates your setup and writes a detailed report to your configured output folder. The report covers:

- All config values
- Config validation (flags invalid values)
- Whether your chapter and metadata folders exist and how many files are in them
- Whether your template files exist
- Your current pane layout (useful for diagnosing targeting issues)
- Whether the script can successfully target your left and top-right panes
- A plain-English summary of any problems found

The report file is temporary and can be deleted at any time.

**When to use:** After initial setup, after making config changes, or any time something isn't working.

---

## Troubleshooting

### Nothing happens when I press the hotkey

1. Confirm **Enable user system command functions** is toggled on in Templater settings
2. Confirm the script file is inside the configured Templater template folder
3. Confirm the script was added under **Template Hotkeys** in Templater settings by browsing to the file (not typed manually)
4. Try running the script from the command palette instead to rule out a hotkey conflict
5. Open the Obsidian developer console (`Ctrl+Shift+I` on Windows, `Cmd+Option+I` on Mac) → Console tab and check for red errors

### The file opens in the wrong pane or a new tab

Your pane layout doesn't match what the script expects. Run the Debug script — the Workspace Layout section will show you exactly what your current layout looks like and the Pane Targeting Test will tell you which panes the script can and can't find.

Rebuild your layout to match the diagram at the top of this document. The layout must be:
- One tab group on the left
- A vertical split on the right containing exactly two tab groups stacked horizontally

### Alt+U doesn't work on Mac

Expected. macOS intercepts many `Alt+letter` combinations to compose special characters. Use `Alt+Shift+U` or pick a different combination. If a hotkey doesn't respond, try adding `Shift`.

### "No match found" even though the file exists

The key extracted from one filename doesn't match the key extracted from the other. Common causes:

- Extra spaces around the separator character
- The metadata prefix doesn't match exactly (check for trailing spaces)
- One file has a different separator character than the other

Run the Debug script and check the file listings in the Folder Checks section to compare filenames side by side.

### "Multiple matches found" warning

Two or more files in the same folder produce the same key. Check for duplicate or similarly named files and rename or delete the extras.

### The New Chapter script says a file already exists but I can't find it

The file may be in the wrong folder, or may have been partially created from a previous failed run. Use Obsidian's search (`Cmd+Shift+F` / `Ctrl+Shift+F`) to search for the key across all files.

---

## How the Pane Targeting Works (Technical)

Obsidian's workspace is a tree of splits and tab groups. Outline Companion traverses this tree by position:

- `root.children[0]` → left tab group (chapter target)
- `root.children[1].children[0]` → top-right tab group (metadata target)

Each tab group's `.children` array contains the individual leaf objects. The script calls `openFile()` on the first available leaf in each group, then calls `setActiveLeaf()` with `focus: true` to bring it into view.

This approach works reliably within a stable layout but will misfire if the pane structure changes. The Debug script's Workspace Layout section prints the full tree so you can inspect it if something goes wrong.

---

## File Naming Quick Reference

```
Chapter:  {CHAPTER_FOLDER}/{key}{SPLIT_CHAR}{title}.md
Metadata: {METADATA_FOLDER}/{METADATA_PREFIX}{key}{SPLIT_CHAR}{title}.md

Example (default config):
  Manuscript/C01 S01 - Once Upon A Time.md
  Reverse Outline/RO C01 S01 - Once Upon A Time.md
```

Titles can differ between the two files — only the key is used for matching.
