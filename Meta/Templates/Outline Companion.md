<%*
// ============================================================================
// Outline Companion — Update Companion
// ============================================================================
// Opens the companion file (chapter ↔ metadata) in the correct pane.
// Configuration is sourced from Outline Companion Config.js via tp.user.
//
// Expected pane layout:
//   ┌─────────────────┬─────────────────┐
//   │                 │   TOP RIGHT     │
//   │      LEFT       │ (Metadata files)│
//   │  (Chapters)     ├─────────────────┤
//   │                 │  BOTTOM RIGHT   │
//   │                 │  (Other notes)  │
//   └─────────────────┴─────────────────┘
// ============================================================================

const {
    CHAPTER_FOLDER,
    METADATA_FOLDER,
    METADATA_PREFIX,
    SPLIT_CHAR,
    NOTICE_DURATION,
    LOG_LEVEL,
    CREATE_DIRECTION,
    PANE_FALLBACK,
} = tp.user.OutlineCompanionConfig();

// ─── LOGGING ─────────────────────────────────────────────────────────────────

function notice(msg, level = "normal") {
    const levels = { silent: 0, normal: 1, verbose: 2, debug: 3 };
    const threshold = levels[level] ?? 1;
    const current = levels[LOG_LEVEL] ?? 1;
    if (current >= threshold) {
        new Notice(msg, NOTICE_DURATION ?? undefined);
    }
}

function noticeAlways(msg) {
    // Used for errors and file creation events — always shown regardless of log level
    new Notice(msg, NOTICE_DURATION ?? undefined);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function extractKey(basename) {
    let name = basename.startsWith(METADATA_PREFIX)
        ? basename.slice(METADATA_PREFIX.length)
        : basename;
    if (SPLIT_CHAR !== "") {
        const splitIndex = name.indexOf(SPLIT_CHAR);
        if (splitIndex !== -1) name = name.slice(0, splitIndex);
    }
    return name.trim();
}

function classifyFile(file) {
    if (file.parent?.path === METADATA_FOLDER) return "metadata";
    if (file.parent?.path === CHAPTER_FOLDER) return "chapter";
    return null;
}

function findMatches(key, targetFolder) {
    return app.vault.getMarkdownFiles()
        .filter(f => f.parent?.path === targetFolder && extractKey(f.basename) === key)
        .sort((a, b) => a.basename.localeCompare(b.basename));
}

function buildNewFilePath(key, targetFileType) {
    if (targetFileType === "chapter") {
        return `${CHAPTER_FOLDER}/${key}.md`;
    } else {
        return `${METADATA_FOLDER}/${METADATA_PREFIX}${key}.md`;
    }
}

function getLeafFromTabGroup(tabGroup) {
    if (!tabGroup?.children?.length) return null;
    const active = tabGroup.children.find(leaf => leaf === tabGroup.activeLeaf)
        ?? tabGroup.children[0];
    return (typeof active?.openFile === "function") ? active : null;
}

function getLeftLeaf() {
    const leftTabGroup = app.workspace.rootSplit?.children?.[0];
    return getLeafFromTabGroup(leftTabGroup);
}

function getTopRightLeaf() {
    // Assumes: root → [leftTabGroup, rightSplit → [topRightTabGroup, bottomRightTabGroup]]
    const rightSplit = app.workspace.rootSplit?.children?.[1];
    const topRightTabGroup = rightSplit?.children?.[0];
    return getLeafFromTabGroup(topRightTabGroup);
}

async function openInLeaf(leaf, file) {
    if (leaf && typeof leaf.openFile === "function") {
        await leaf.openFile(file);
        app.workspace.setActiveLeaf(leaf, { focus: true });
        return true;
    }
    return false;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

notice("Companion: Script started", "debug");

const activeFile = tp.file.find_tfile(tp.file.title);
if (!activeFile) {
    noticeAlways("Companion: Could not identify the active file.");
    return;
}
notice("Companion: Active file is " + activeFile.basename, "debug");

const fileType = classifyFile(activeFile);
if (!fileType) {
    noticeAlways("Companion: Active file is not in the chapter or metadata folder.");
    return;
}
notice("Companion: File type is " + fileType, "debug");

const key = extractKey(activeFile.basename);
if (!key) {
    noticeAlways("Companion: Could not extract a key from the filename.");
    return;
}
notice("Companion: Key is '" + key + "'", "debug");

const targetFolder = fileType === "chapter" ? METADATA_FOLDER : CHAPTER_FOLDER;
const targetFileType = fileType === "chapter" ? "metadata" : "chapter";
let matches = findMatches(key, targetFolder);
notice("Companion: Found " + matches.length + " match(es)", "debug");

// ─── CREATE IF MISSING ───────────────────────────────────────────────────────

if (matches.length === 0) {
    const canCreate =
        CREATE_DIRECTION === "both" ||
        (CREATE_DIRECTION === "metadata-only" && targetFileType === "metadata") ||
        (CREATE_DIRECTION === "chapter-only" && targetFileType === "chapter");

    if (!canCreate) {
        noticeAlways(`Companion: No match found for "${key}" in ${targetFolder}/. File creation is disabled for this direction.`);
        return;
    }

    const newPath = buildNewFilePath(key, targetFileType);
    try {
        await app.vault.create(newPath, "");
        noticeAlways(`Companion: No match found — created "${newPath}".`);
        matches = findMatches(key, targetFolder);
    } catch (e) {
        noticeAlways(`Companion: Failed to create "${newPath}". It may already exist.`);
        return;
    }
}

// ─────────────────────────────────────────────────────────────────────────────

if (matches.length > 1) {
    notice(
        `Companion: Multiple matches for "${key}" in ${targetFolder}/ — opened the first. Check your file names.`,
        "normal"
    );
}

const companion = matches[0];
notice("Companion: Opening " + companion.basename, "verbose");

const targetLeaf = fileType === "chapter" ? getTopRightLeaf() : getLeftLeaf();
const success = await openInLeaf(targetLeaf, companion);

if (!success) {
    if (PANE_FALLBACK === "new-tab") {
        notice("Companion: Could not target the expected pane — opening in a new tab.", "normal");
        await app.workspace.getLeaf("tab").openFile(companion);
    } else {
        notice("Companion: Could not target the expected pane. Check your layout.", "normal");
    }
} else {
    notice("Companion: Opened " + companion.basename, "verbose");
}
%>
