<%*
// ============================================================================
// Outline Companion — New Chapter
// ============================================================================
// Prompts for a key and optional title, then creates both a chapter file
// and a metadata file from their respective templates. Opens both files
// in the correct panes.
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
    CHAPTER_TEMPLATE,
    METADATA_TEMPLATE,
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
    new Notice(msg, NOTICE_DURATION ?? undefined);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildFilename(prefix, key, title) {
    const titlePart = title && SPLIT_CHAR !== "" ? `${SPLIT_CHAR}${title}` : "";
    return `${prefix}${key}${titlePart}`;
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

async function openWithFallback(leaf, file, label) {
    const success = await openInLeaf(leaf, file);
    if (!success) {
        if (PANE_FALLBACK === "new-tab") {
            notice(`New Chapter: Could not target the ${label} pane — opening in a new tab.`, "normal");
            await app.workspace.getLeaf("tab").openFile(file);
        } else {
            notice(`New Chapter: Could not target the ${label} pane. Check your layout.`, "normal");
        }
    }
}

// ─── PROMPTS ─────────────────────────────────────────────────────────────────

notice("New Chapter: Starting prompts", "debug");

const key = await tp.system.prompt(
    "Enter the key for this chapter (e.g. C01 S01, Chapter 1, Part 2):",
    "",
    true // throw on cancel
);

if (!key || key.trim() === "") {
    noticeAlways("New Chapter: No key entered. Cancelled.");
    return;
}

const title = await tp.system.prompt(
    "Enter a title (leave blank to skip):",
    "",
    false // don't throw on cancel — blank title is valid
) ?? "";

notice("New Chapter: Key is '" + key.trim() + "', title is '" + title.trim() + "'", "debug");

// ─── BUILD PATHS ─────────────────────────────────────────────────────────────

const cleanKey = key.trim();
const cleanTitle = title.trim();

const chapterFilename = buildFilename("", cleanKey, cleanTitle);
const metadataFilename = buildFilename(METADATA_PREFIX, cleanKey, cleanTitle);
const chapterPath = `${CHAPTER_FOLDER}/${chapterFilename}.md`;
const metadataPath = `${METADATA_FOLDER}/${metadataFilename}.md`;

notice("New Chapter: Chapter path → " + chapterPath, "debug");
notice("New Chapter: Metadata path → " + metadataPath, "debug");

// ─── CHECK FOR EXISTING FILES ─────────────────────────────────────────────────

const existingChapter = tp.file.find_tfile(chapterFilename);
const existingMetadata = tp.file.find_tfile(metadataFilename);

if (existingChapter) {
    noticeAlways(`New Chapter: A chapter file already exists for "${cleanKey}". Cancelled to avoid overwriting.`);
    return;
}

if (existingMetadata) {
    noticeAlways(`New Chapter: A metadata file already exists for "${cleanKey}". Cancelled to avoid overwriting.`);
    return;
}

// ─── CREATE FILES ─────────────────────────────────────────────────────────────

let chapterFile, metadataFile;

try {
    if (CHAPTER_TEMPLATE && CHAPTER_TEMPLATE !== "") {
        const chapterTemplate = tp.file.find_tfile(CHAPTER_TEMPLATE.replace(/\.md$/, ""));
        if (!chapterTemplate) {
            noticeAlways(`New Chapter: Chapter template not found at "${CHAPTER_TEMPLATE}". Creating blank file instead.`);
            await app.vault.create(chapterPath, "");
        } else {
            await tp.file.create_new(chapterTemplate, chapterFilename, false,
                app.vault.getAbstractFileByPath(CHAPTER_FOLDER));
        }
    } else {
        await app.vault.create(chapterPath, "");
    }
    chapterFile = tp.file.find_tfile(chapterFilename);
    notice("New Chapter: Chapter file created", "verbose");
} catch (e) {
    noticeAlways(`New Chapter: Failed to create chapter file at "${chapterPath}".`);
    return;
}

try {
    if (METADATA_TEMPLATE && METADATA_TEMPLATE !== "") {
        const metadataTemplate = tp.file.find_tfile(METADATA_TEMPLATE.replace(/\.md$/, ""));
        if (!metadataTemplate) {
            noticeAlways(`New Chapter: Metadata template not found at "${METADATA_TEMPLATE}". Creating blank file instead.`);
            await app.vault.create(metadataPath, "");
        } else {
            await tp.file.create_new(metadataTemplate, metadataFilename, false,
                app.vault.getAbstractFileByPath(METADATA_FOLDER));
        }
    } else {
        await app.vault.create(metadataPath, "");
    }
    metadataFile = tp.file.find_tfile(metadataFilename);
    notice("New Chapter: Metadata file created", "verbose");
} catch (e) {
    noticeAlways(`New Chapter: Failed to create metadata file at "${metadataPath}".`);
    return;
}

// ─── OPEN FILES ──────────────────────────────────────────────────────────────

if (!chapterFile || !metadataFile) {
    noticeAlways("New Chapter: Files were created but could not be located. Check your folders.");
    return;
}

await openWithFallback(getLeftLeaf(), chapterFile, "left");
await openWithFallback(getTopRightLeaf(), metadataFile, "top-right");

noticeAlways(`New Chapter: Created and opened "${chapterFilename}" and "${metadataFilename}".`);
%>
