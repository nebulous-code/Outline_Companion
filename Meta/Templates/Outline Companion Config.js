// ============================================================================
// Outline Companion Config
// ============================================================================
// This file is shared by all Outline Companion scripts. Update values here
// and they will apply everywhere automatically.
//
// SETUP: In Obsidian, go to Settings → Templater → User Script Functions
// and point it to the folder containing this file.
// ============================================================================

module.exports = {

    // ─── FOLDERS ─────────────────────────────────────────────────────────────
    // Vault-relative paths to your chapter and metadata folders.
    // Do not include a trailing slash.

    CHAPTER_FOLDER: "Manuscript",
    METADATA_FOLDER: "Reverse Outline",


    // ─── NAMING ──────────────────────────────────────────────────────────────
    // METADATA_PREFIX: The prefix applied to metadata filenames.
    //   Example: "RO " produces "RO C01 S01 - Title.md"
    //
    // SPLIT_CHAR: The string that separates the key from the title.
    //   Example: " - " means "C01 S01 - Title" → key is "C01 S01"
    //   Set to "" to skip splitting and use the entire filename as the key.

    METADATA_PREFIX: "RO ",
    SPLIT_CHAR: " - ",


    // ─── NOTICES ─────────────────────────────────────────────────────────────
    // NOTICE_DURATION: How long notices stay on screen, in milliseconds.
    //   10000 = 10 seconds (default)
    //   0     = stays open until clicked
    //   null  = uses Obsidian's default (~5 seconds)

    NOTICE_DURATION: 10000,


    // ─── LOGGING ─────────────────────────────────────────────────────────────
    // Controls how much feedback the scripts give during normal use.
    //
    //   "silent"  — no notices except errors and file creation events
    //   "normal"  — warnings and file creation events (recommended)
    //   "verbose" — adds a confirmation notice when a file is found and opened
    //   "debug"   — adds step-by-step notices, useful during initial setup

    LOG_LEVEL: "normal",


    // ─── FILE CREATION ───────────────────────────────────────────────────────
    // Controls which direction the Update Companion script is allowed to
    // create missing files.
    //
    //   "both"          — creates whichever companion file is missing
    //   "metadata-only" — only creates metadata files, never chapter files
    //   "chapter-only"  — only creates chapter files, never metadata files

    CREATE_DIRECTION: "both",


    // ─── PANE FALLBACK ───────────────────────────────────────────────────────
    // What to do if the script cannot find the expected pane.
    //
    //   "new-tab" — opens the file in a new tab instead
    //   "none"    — shows a notice and does nothing

    PANE_FALLBACK: "new-tab",


    // ─── TEMPLATES ───────────────────────────────────────────────────────────
    // Vault-relative paths to the template files used when creating new files.
    // These are used by the New Chapter script.
    // Set to "" to create blank files instead.

    CHAPTER_TEMPLATE: "Templates/Chapter Template.md",
    METADATA_TEMPLATE: "Templates/Metadata Template.md",


    // ─── DEBUG OUTPUT ────────────────────────────────────────────────────────
    // Folder where the Debug script writes its report files.
    // Set to "" to write to the vault root.

    DEBUG_OUTPUT_FOLDER: "",

};
