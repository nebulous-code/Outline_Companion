<%*
// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MANUSCRIPT_FOLDER = "Manuscript";
const RO_FOLDER = "Metadata";
const RO_PREFIX = "Meta ";
// ─────────────────────────────────────────────────────────────────────────────

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function extractKey(basename) {
    let name = basename.startsWith(RO_PREFIX)
        ? basename.slice(RO_PREFIX.length)
        : basename;
    const dashIndex = name.indexOf(" - ");
    if (dashIndex !== -1) name = name.slice(0, dashIndex);
    return name.trim();
}

function classifyFile(file) {
    if (file.parent?.path === RO_FOLDER) return "RO";
    if (file.parent?.path === MANUSCRIPT_FOLDER) return "chapter";
    return null;
}

function findMatches(key, targetFolder) {
    return app.vault.getMarkdownFiles()
        .filter(f => f.parent?.path === targetFolder && extractKey(f.basename) === key)
        .sort((a, b) => a.basename.localeCompare(b.basename));
}

// Tab group's active leaf is the one matching the group's currentTab index,
// or we just take child[0] as fallback — any leaf in the group works for openFile
function getLeafFromTabGroup(tabGroup) {
    if (!tabGroup?.children?.length) return null;
    // Try to get the currently active tab first
    const active = tabGroup.children.find(leaf => leaf === tabGroup.activeLeaf) 
        ?? tabGroup.children[0];
    return (typeof active?.openFile === "function") ? active : null;
}

function getLeftLeaf() {
    const leftTabGroup = app.workspace.rootSplit?.children?.[0];
    return getLeafFromTabGroup(leftTabGroup);
}

function getTopRightLeaf() {
    // Layout assumption: root → [leftTabGroup, rightSplit → [topRightTabGroup, bottomRightTabGroup]]
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
    await app.workspace.getLeaf("tab").openFile(file);
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── MAIN ────────────────────────────────────────────────────────────────────

const activeFile = tp.file.find_tfile(tp.file.title);
if (!activeFile) {
    new Notice("Companion: Could not identify the active file.");
    return;
}

const fileType = classifyFile(activeFile);
if (!fileType) {
    new Notice("Companion: Active file is not in Manuscript/ or Reverse Outline/.");
    return;
}

const key = extractKey(activeFile.basename);
if (!key) {
    new Notice("Companion: Could not extract a chapter/scene key from the filename.");
    return;
}

const targetFolder = fileType === "chapter" ? RO_FOLDER : MANUSCRIPT_FOLDER;
const matches = findMatches(key, targetFolder);

if (matches.length === 0) {
    new Notice(`Companion: No match found for "${key}" in ${targetFolder}/`);
    return;
}

if (matches.length > 1) {
    new Notice(`Companion: Multiple matches for "${key}" in ${targetFolder}/ — opened the first. Check your file names.`, 6000);
}

const companion = matches[0];

const targetLeaf = fileType === "chapter" ? getTopRightLeaf() : getLeftLeaf();
const success = await openInLeaf(targetLeaf, companion);

if (!success) {
    new Notice("Companion: Could not target the expected pane — opened in a new tab instead.");
}
// ─────────────────────────────────────────────────────────────────────────────
%>